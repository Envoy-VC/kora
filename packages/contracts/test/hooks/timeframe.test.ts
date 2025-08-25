import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

const EventLog = ethers.EventLog;

import type { HookTests, TimeframeHook } from "../../types";
import { decryptHandle, getSigners, type Signers } from "../helpers";

type Env = {
  executorAddress: string;
  hookTest: HookTests;
  hook: TimeframeHook;
};

async function deployFixture(): Promise<Env> {
  const { deployer } = await getSigners();

  const HookTest = await ethers.getContractFactory("HookTests");
  const hookTest = await HookTest.connect(deployer).deploy();
  await hookTest.waitForDeployment();

  // Random address for testing purposes
  const executorAddress = hookTest.target as string;

  const TimeframeHook = await ethers.getContractFactory("TimeframeHook");
  const hook = await TimeframeHook.connect(deployer).deploy(executorAddress);
  await hook.waitForDeployment();

  return {
    executorAddress,
    hook,
    hookTest,
  };
}

describe("Timeframe Hook Tests", () => {
  let signers: Signers;
  let env: Env;

  before(async () => {
    signers = await getSigners();
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    env = await deployFixture();
  });

  const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

  async function initialize() {
    const { alice } = signers;
    const { hook, hookTest, executorAddress } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const vars = await fhevm
      .createEncryptedInput(hook.target as string, executorAddress)
      .add64(Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS)
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const initParams = abiCoder.encode(
      ["address", "bytes32", "bytes"],
      [alice.address, vars.handles[0], vars.inputProof],
    );

    await hookTest
      .connect(alice)
      .initialize(strategyId, initParams, hook.target as string);
    return strategyId;
  }

  it("should deploy TimeframeHook", () => {
    expect(env.hook.target).to.not.be.null;
  });

  it("should revert if initialized by non-executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const vars = await fhevm
      .createEncryptedInput(hook.target as string, alice.address)
      .add64(Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS)
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const initParams = abiCoder.encode(
      ["address", "bytes32", "bytes"],
      [alice.address, vars.handles[0], vars.inputProof],
    );

    await expect(hook.connect(alice).initialize(strategyId, initParams))
      .to.be.revertedWithCustomError(hook, "NotExecutor")
      .withArgs(alice.address);
  });

  it("should successfully initialize with executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = await initialize();

    const validUntil = await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.connect(alice)._validUntil(strategyId),
      signer: alice,
    });

    expect(validUntil).to.eq(
      Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS,
    );
  });
  it("should return true on valid period", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

    await network.provider.send("evm_increaseTime", [100]);

    const variables = await fhevm
      .createEncryptedInput(hookTest.target as string, alice.address)
      .add64(ethers.parseUnits("0.1", 6))
      .addBool(true)
      .encrypt();

    const tx = await hookTest.connect(alice).preSwap(
      strategyId,
      {
        amount0: variables.handles[0],
        inputProof: variables.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyId,
      },
      hook.target as string,
    );
    const receipt = await tx.wait();
    const log = receipt?.logs.find((l) => {
      if (l instanceof EventLog) {
        return l.eventName === "PreSwapResult";
      }
      return false;
    });
    const handle = log instanceof EventLog ? log.args.result : null;

    const isAllowed = await decryptHandle({
      contractAddress: hookTest.target as string,
      handle,
      signer: alice,
    });

    expect(isAllowed).to.eq(true);
  });
  it("should return false after valid period", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

    await network.provider.send("evm_increaseTime", [ONE_DAY_IN_SECONDS]);

    const variables = await fhevm
      .createEncryptedInput(hookTest.target as string, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .addBool(true)
      .encrypt();

    const tx = await hookTest.connect(alice).preSwap(
      strategyId,
      {
        amount0: variables.handles[0],
        inputProof: variables.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyId,
      },
      hook.target as string,
    );
    const receipt = await tx.wait();
    const log = receipt?.logs.find((l) => {
      if (l instanceof EventLog) {
        return l.eventName === "PreSwapResult";
      }
      return false;
    });
    const handle = log instanceof EventLog ? log.args.result : null;

    const isAllowed = await decryptHandle({
      contractAddress: hookTest.target as string,
      handle,
      signer: alice,
    });

    expect(isAllowed).to.eq(false);
  });
});

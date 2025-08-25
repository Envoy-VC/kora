import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

const EventLog = ethers.EventLog;

import type { FrequencyHook, HookTests } from "../../types";
import { decryptHandle, getSigners, type Signers } from "../helpers";

type Env = {
  executorAddress: string;
  hookTest: HookTests;
  hook: FrequencyHook;
};

async function deployFixture(): Promise<Env> {
  const { deployer } = await getSigners();

  const HookTest = await ethers.getContractFactory("HookTests");
  const hookTest = await HookTest.connect(deployer).deploy();
  await hookTest.waitForDeployment();

  // Random address for testing purposes
  const executorAddress = hookTest.target as string;

  const FrequencyHook = await ethers.getContractFactory("FrequencyHook");
  const hook = await FrequencyHook.connect(deployer).deploy(executorAddress);
  await hook.waitForDeployment();

  return {
    executorAddress,
    hook,
    hookTest,
  };
}

describe("Frequency Hook Tests", () => {
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

  const ONE_HOUR_IN_SECONDS = 1 * 60 * 60;

  async function initialize() {
    const { alice } = signers;
    const { hook, hookTest, executorAddress } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const vars = await fhevm
      .createEncryptedInput(hook.target as string, executorAddress)
      .add64(ONE_HOUR_IN_SECONDS)
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

  it("should deploy FrequencyHook", () => {
    expect(env.hook.target).to.not.be.null;
  });

  it("should revert if initialized by non-executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const vars = await fhevm
      .createEncryptedInput(hook.target as string, alice.address)
      .add64(ONE_HOUR_IN_SECONDS)
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

    const lastExecuted = await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.connect(alice)._lastExecutedAt(strategyId),
      signer: alice,
    });

    expect(lastExecuted).to.eq(0);
  });
  it("should give current timestamp on first execute", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

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

    await hookTest.connect(alice).postSwap(
      strategyId,
      {
        externalCheck: variables.handles[1],
        handle: variables.handles[0],
        inputProof: variables.inputProof,
        intentId: ethers.randomBytes(32),
        revertData: "0x",
        strategyId: strategyId,
        user: alice.address,
      },
      hook.target as string,
    );

    const lastExecuted = await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.connect(alice)._lastExecutedAt(strategyId),
      signer: alice,
    });

    expect(lastExecuted).to.be.gt(0);
  });
  it("should revert if next execution before frequency", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

    const variables = await fhevm
      .createEncryptedInput(hookTest.target as string, alice.address)
      .add64(ethers.parseUnits("0.1", 6))
      .encrypt();

    await hookTest.connect(alice).preSwap(
      strategyId,
      {
        amount0: variables.handles[0],
        inputProof: variables.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyId,
      },
      hook.target as string,
    );

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
  it("should execute if next execution adter frequency", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

    const variables = await fhevm
      .createEncryptedInput(hookTest.target as string, alice.address)
      .add64(ethers.parseUnits("0.1", 6))
      .encrypt();

    await hookTest.connect(alice).preSwap(
      strategyId,
      {
        amount0: variables.handles[0],
        inputProof: variables.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyId,
      },
      hook.target as string,
    );

    await network.provider.send("evm_increaseTime", [ONE_HOUR_IN_SECONDS + 1]);

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
  // it("should return false after valid period", async () => {
  //   const { alice } = signers;
  //   const { hook, hookTest } = env;
  //   const strategyId = await initialize();

  //   await network.provider.send("evm_increaseTime", [ONE_DAY_IN_SECONDS]);

  //   const variables = await fhevm
  //     .createEncryptedInput(hookTest.target as string, alice.address)
  //     .add64(ethers.parseUnits("0.5", 6))
  //     .addBool(true)
  //     .encrypt();

  //   const tx = await hookTest.connect(alice).preSwap(
  //     strategyId,
  //     {
  //       amount0: variables.handles[0],
  //       inputProof: variables.inputProof,
  //       intentId: ethers.randomBytes(32),
  //       strategyId: strategyId,
  //     },
  //     hook.target as string,
  //   );
  //   const receipt = await tx.wait();
  //   const log = receipt?.logs.find((l) => {
  //     if (l instanceof EventLog) {
  //       return l.eventName === "PreSwapResult";
  //     }
  //     return false;
  //   });
  //   const handle = log instanceof EventLog ? log.args.result : null;

  //   const isAllowed = await decryptHandle({
  //     contractAddress: hookTest.target as string,
  //     handle,
  //     signer: alice,
  //   });

  //   expect(isAllowed).to.eq(false);
  // });
});

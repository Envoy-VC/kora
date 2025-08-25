import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

const EventLog = ethers.EventLog;

import type { HookTests, PurchaseAmountHook } from "../../types";
import { decryptHandle, getSigners, type Signers } from "../helpers";

type Env = {
  executorAddress: string;
  hookTest: HookTests;
  hook: PurchaseAmountHook;
};

async function deployFixture(): Promise<Env> {
  const { deployer } = await getSigners();

  const HookTest = await ethers.getContractFactory("HookTests");
  const hookTest = await HookTest.connect(deployer).deploy();
  await hookTest.waitForDeployment();

  // Random address for testing purposes
  const executorAddress = hookTest.target as string;

  const PurchaseAmountHook =
    await ethers.getContractFactory("PurchaseAmountHook");
  const hook =
    await PurchaseAmountHook.connect(deployer).deploy(executorAddress);
  await hook.waitForDeployment();

  return {
    executorAddress,
    hook,
    hookTest,
  };
}

describe("PurchaseAmount  Hook Tests", () => {
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

  async function initialize() {
    const { alice } = signers;
    const { hook, hookTest, executorAddress } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const encMaxBudget = await fhevm
      .createEncryptedInput(hook.target as string, executorAddress)
      .add64(ethers.parseUnits("0.1", 6))
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const initParams = abiCoder.encode(
      ["address", "bytes32", "bytes"],
      [alice.address, encMaxBudget.handles[0], encMaxBudget.inputProof],
    );

    await hookTest
      .connect(alice)
      .initialize(strategyId, initParams, hook.target as string);
    return strategyId;
  }

  it("should deploy PurchaseAmountHook", () => {
    expect(env.hook.target).to.not.be.null;
  });

  it("should revert if initialized by non-executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const maxPurchaseAmountEnc = await fhevm
      .createEncryptedInput(hook.target as string, alice.address)
      .add64(ethers.parseUnits("0.1", 6))
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const initParams = abiCoder.encode(
      ["address", "bytes32", "bytes"],
      [
        alice.address,
        maxPurchaseAmountEnc.handles[0],
        maxPurchaseAmountEnc.inputProof,
      ],
    );

    await expect(hook.connect(alice).initialize(strategyId, initParams))
      .to.be.revertedWithCustomError(hook, "NotExecutor")
      .withArgs(alice.address);
  });

  it("should successfully initialize with executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = await initialize();

    const maxPurchaseAmount = await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.connect(alice)._maxPurchaseAmount(strategyId),
      signer: alice,
    });

    expect(maxPurchaseAmount).to.eq(ethers.parseUnits("0.1", 6));
  });

  it("should return false on greater amount than maxPurchaseAmount", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

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
  it("should return true on less than or equal than maxPurchaseAmount", async () => {
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
});

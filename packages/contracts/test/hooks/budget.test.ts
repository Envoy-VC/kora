import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

import type { BudgetHook, HookTests } from "../../types";
import { decryptHandle, getSigners, type Signers } from "../helpers";

type Env = {
  executorAddress: string;
  hookTest: HookTests;
  hook: BudgetHook;
};

async function deployFixture(): Promise<Env> {
  const { deployer } = await getSigners();

  const HookTest = await ethers.getContractFactory("HookTests");
  const hookTest = await HookTest.connect(deployer).deploy();
  await hookTest.waitForDeployment();

  // Random address for testing purposes
  const executorAddress = hookTest.target as string;

  const BudgetHook = await ethers.getContractFactory("BudgetHook");
  const hook = await BudgetHook.connect(deployer).deploy(executorAddress);
  await hook.waitForDeployment();

  return {
    executorAddress,
    hook,
    hookTest,
  };
}

describe("Budget Hook Tests", () => {
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
      .add64(ethers.parseUnits("1", 6))
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

  it("should deploy BudgetHook", () => {
    expect(env.hook.target).to.not.be.null;
  });

  it("should revert if initialized by non-executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = ethers.hexlify(ethers.randomBytes(32));

    const encMaxBudget = await fhevm
      .createEncryptedInput(hook.target as string, alice.address)
      .add64(ethers.parseUnits("1", 6))
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const initParams = abiCoder.encode(
      ["address", "bytes32", "bytes"],
      [alice.address, encMaxBudget.handles[0], encMaxBudget.inputProof],
    );

    await expect(hook.connect(alice).initialize(strategyId, initParams))
      .to.be.revertedWithCustomError(hook, "NotExecutor")
      .withArgs(alice.address);
  });

  it("should successfully initialize with executor", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = await initialize();

    const maxBudgetHandle = await hook.connect(alice).maxBudget(strategyId);
    const maxBudget = await decryptHandle({
      contractAddress: hook.target as string,
      handle: maxBudgetHandle,
      signer: alice,
    });

    expect(maxBudget).to.eq(ethers.parseUnits("1", 6));
  });

  it("should increase spent after preSwap", async () => {
    const { alice } = signers;
    const { hook, hookTest } = env;
    const strategyId = await initialize();

    const spentBefore = (await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.spent(strategyId),
      signer: alice,
    })) as bigint;

    const variables = await fhevm
      .createEncryptedInput(hookTest.target as string, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .addBool(true)
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

    const spentAfter = (await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.spent(strategyId),
      signer: alice,
    })) as bigint;

    expect(spentAfter).to.eq(spentBefore + ethers.parseUnits("0.5", 6));
  });
  it("should allow owner of hook to update maxBudget", async () => {
    const { alice } = signers;
    const { hook } = env;
    const strategyId = await initialize();

    const maxBudgetBefore = (await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.maxBudget(strategyId),
      signer: alice,
    })) as bigint;

    const newBudgetEnc = await fhevm
      .createEncryptedInput(hook.target as string, alice.address)
      .add64(ethers.parseUnits("2", 6))
      .encrypt();

    await hook
      .connect(alice)
      .updateMaxBudget(
        strategyId,
        newBudgetEnc.handles[0],
        newBudgetEnc.inputProof,
      );

    const maxBudgetAfter = (await decryptHandle({
      contractAddress: hook.target as string,
      handle: await hook.maxBudget(strategyId),
      signer: alice,
    })) as bigint;

    expect(maxBudgetBefore).to.eq(ethers.parseUnits("1", 6));
    expect(maxBudgetAfter).to.eq(ethers.parseUnits("2", 6));
  });
});

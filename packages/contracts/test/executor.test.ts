import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

import {
  approveEncryptedToken,
  approveMockTokens,
  depositMockTokens,
  getEncryptedTokenBalance,
  getSigners,
  mintMockTokens,
  type Signers,
} from "./helpers";
import { createEnvironment, type Environment } from "./helpers/env";

describe("Wrapped Encrypted Token Tests", () => {
  let signers: Signers;
  let env: Environment;

  before(async () => {
    signers = await getSigners();
    env = await createEnvironment();
  });

  beforeEach(function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
  });

  it("full user flow", async () => {
    const { alice } = signers;
    const { weth, eWETH, koraExecutor, eUSDC, hooks } = env;

    const koraExecutorAddress = await koraExecutor.getAddress();

    const amount = ethers.parseUnits("1", 6);

    // Step 1: Give Alice some weth, wrap them, approve to KoraExecutor
    await mintMockTokens(weth, alice.address, amount);
    await approveMockTokens(weth, alice, eWETH.target as string, amount);
    await depositMockTokens(eWETH, alice, amount);
    await approveEncryptedToken(eWETH, alice, koraExecutorAddress, amount);

    const salt = ethers.hexlify(ethers.randomBytes(32));

    const strategyId = await koraExecutor.computeStrategyId(
      alice.address,
      salt,
    );

    // Build Hooks

    // 1. Budget Hook
    const maxBudget = await fhevm
      .createEncryptedInput(
        await hooks.budgetHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(ethers.parseUnits("1", 6))
      .encrypt();

    // 2. Purchase Amount Hook
    // Max Amount of tokens per transaction.
    const maxPurchaseAmount = await fhevm
      .createEncryptedInput(
        await hooks.purchaseAmountHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();

    // 3. Timeframe Hook
    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    const validUntil = await fhevm
      .createEncryptedInput(
        await hooks.timeframeHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(Math.round(Date.now() / 1000) + ONE_YEAR_IN_SECONDS)
      .encrypt();

    // 4. Frequency Hook
    const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
    const frequency = await fhevm
      .createEncryptedInput(
        await hooks.frequencyHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(ONE_DAY_IN_SECONDS)
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    const strategyHooks = [
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [alice.address, maxBudget.handles[0], maxBudget.inputProof],
        ),
        hook: hooks.budgetHook.target,
      },
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [
            alice.address,
            maxPurchaseAmount.handles[0],
            maxPurchaseAmount.inputProof,
          ],
        ),
        hook: hooks.purchaseAmountHook.target,
      },
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [alice.address, validUntil.handles[0], validUntil.inputProof],
        ),
        hook: hooks.timeframeHook.target,
      },
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [alice.address, frequency.handles[0], frequency.inputProof],
        ),
        hook: hooks.frequencyHook.target,
      },
    ];

    // Create A Strategy
    await koraExecutor
      .connect(alice)
      .createStrategy(alice.address, strategyHooks, salt);

    const encryptedAmount = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();

    const { clearBalance: eWETHBefore } = await getEncryptedTokenBalance(
      eWETH,
      alice,
    );
    const { clearBalance: eUSDCBefore } = await getEncryptedTokenBalance(
      eUSDC,
      alice,
    );

    const executeTx = await koraExecutor.connect(alice).executeBatch([
      {
        amount0: encryptedAmount.handles[0],
        inputProof: encryptedAmount.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyId,
      },
    ]);

    await executeTx.wait();
    await fhevm.awaitDecryptionOracle();

    const { clearBalance: eWETHAfter } = await getEncryptedTokenBalance(
      eWETH,
      alice,
    );

    const { clearBalance: eUSDCAfter } = await getEncryptedTokenBalance(
      eUSDC,
      alice,
    );

    expect(eWETHAfter).to.be.eq(ethers.parseUnits("0.5", 6));
    expect(eUSDCAfter).to.be.gt(eUSDCBefore);
    expect(eWETHBefore).to.be.gt(eWETHAfter);

    console.log("\n================= First Execute =================");
    console.log("eWETHBefore", ethers.formatUnits(eWETHBefore, 6));
    console.log("eUSDCBefore", ethers.formatUnits(eUSDCBefore, 6));
    console.log("eWETHAfter", ethers.formatUnits(eWETHAfter, 6));
    console.log("eUSDCAfter", ethers.formatUnits(eUSDCAfter, 6));
    console.log("=================================================\n");

    const { clearBalance: eWETHBefore1 } = await getEncryptedTokenBalance(
      eWETH,
      alice,
    );
    const { clearBalance: eUSDCBefore1 } = await getEncryptedTokenBalance(
      eUSDC,
      alice,
    );

    const encryptedAmount2 = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();

    const a = await koraExecutor.connect(alice).executeBatch([
      {
        amount0: encryptedAmount2.handles[0],
        inputProof: encryptedAmount2.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyId,
      },
    ]);

    await a.wait();
    await fhevm.awaitDecryptionOracle();

    const { clearBalance: eWETHAfter1 } = await getEncryptedTokenBalance(
      eWETH,
      alice,
    );
    const { clearBalance: eUSDCAfter1 } = await getEncryptedTokenBalance(
      eUSDC,
      alice,
    );

    console.log("\n================= Second Execute =================");
    console.log("eWETHBefore", ethers.formatUnits(eWETHBefore1, 6));
    console.log("eUSDCBefore", ethers.formatUnits(eUSDCBefore1, 6));
    console.log("eWETHAfter", ethers.formatUnits(eWETHAfter1, 6));
    console.log("eUSDCAfter", ethers.formatUnits(eUSDCAfter1, 6));
    console.log("=================================================\n");
  });
});

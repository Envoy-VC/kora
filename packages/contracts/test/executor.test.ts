// biome-ignore lint/correctness/noUndeclaredDependencies: safe
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
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

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  const ONE_HOUR_IN_SECONDS = 1 * 60 * 60;

  async function getEncryptedBalances(signer: HardhatEthersSigner) {
    const { eWETH, eUSDC } = env;
    const { clearBalance: eWETHBalance } = await getEncryptedTokenBalance(
      eWETH,
      signer,
    );
    const { clearBalance: eUSDCBalance } = await getEncryptedTokenBalance(
      eUSDC,
      signer,
    );

    return { eUSDCBalance, eWETHBalance };
  }

  async function createStrategy(
    signer: HardhatEthersSigner,
    maxBudget: string,
    maxPurchaseAmount: string,
    validUntil: number,
    frequency: number,
  ) {
    const { weth, eWETH, koraExecutor, hooks } = env;

    const koraExecutorAddress = await koraExecutor.getAddress();

    const amount = ethers.parseUnits(maxBudget, 6);

    // Step 1: Give User some weth, wrap them, approve to KoraExecutor
    await mintMockTokens(weth, signer.address, amount);
    await approveMockTokens(weth, signer, eWETH.target as string, amount);
    await depositMockTokens(eWETH, signer, amount);
    await approveEncryptedToken(eWETH, signer, koraExecutorAddress, amount);

    const salt = ethers.hexlify(ethers.randomBytes(32));

    const strategyId = await koraExecutor.computeStrategyId(
      signer.address,
      salt,
    );

    // Build Hooks

    // 1. Budget Hook
    const maxBudgetEnc = await fhevm
      .createEncryptedInput(
        await hooks.budgetHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(ethers.parseUnits(maxBudget, 6))
      .encrypt();

    // 2. Purchase Amount Hook
    // Max Amount of tokens per transaction.
    const maxPurchaseAmountEnc = await fhevm
      .createEncryptedInput(
        await hooks.purchaseAmountHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(ethers.parseUnits(maxPurchaseAmount, 6))
      .encrypt();

    // 3. Timeframe Hook
    const validUntilEnc = await fhevm
      .createEncryptedInput(
        await hooks.timeframeHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(validUntil)
      .encrypt();

    // 4. Frequency Hook
    const frequencyEnc = await fhevm
      .createEncryptedInput(
        await hooks.frequencyHook.getAddress(),
        koraExecutorAddress,
      )
      .add64(frequency)
      .encrypt();

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    const strategyHooks = [
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [signer.address, maxBudgetEnc.handles[0], maxBudgetEnc.inputProof],
        ),
        hook: hooks.budgetHook.target,
      },
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [
            signer.address,
            maxPurchaseAmountEnc.handles[0],
            maxPurchaseAmountEnc.inputProof,
          ],
        ),
        hook: hooks.purchaseAmountHook.target,
      },
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [signer.address, validUntilEnc.handles[0], validUntilEnc.inputProof],
        ),
        hook: hooks.timeframeHook.target,
      },
      {
        data: abiCoder.encode(
          ["address", "bytes32", "bytes"],
          [signer.address, frequencyEnc.handles[0], frequencyEnc.inputProof],
        ),
        hook: hooks.frequencyHook.target,
      },
    ];

    // Create A Strategy
    await koraExecutor
      .connect(signer)
      .createStrategy(signer.address, strategyHooks, salt);

    return strategyId;
  }

  it("should execute batch intents", async () => {
    const { alice, bob } = signers;
    const { koraExecutor } = env;

    const koraExecutorAddress = await koraExecutor.getAddress();

    const strategyIdAlice = await createStrategy(
      alice,
      "1",
      "0.5",
      Math.round(Date.now() / 1000) + ONE_YEAR_IN_SECONDS,
      ONE_HOUR_IN_SECONDS,
    );
    const strategyIdBob = await createStrategy(
      bob,
      "1",
      "0.25",
      Math.round(Date.now() / 1000) + ONE_YEAR_IN_SECONDS,
      ONE_HOUR_IN_SECONDS,
    );

    const encryptedAmountAlice = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();
    const encryptedAmountBob = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.25", 6))
      .encrypt();

    const aliceBefore = await getEncryptedBalances(alice);
    const bobBefore = await getEncryptedBalances(bob);

    // Before Alice and Bob execute, they should have 1 eWETH and 1 eWETH
    expect(aliceBefore.eWETHBalance).to.be.eq(ethers.parseUnits("1", 6));
    expect(bobBefore.eWETHBalance).to.be.eq(ethers.parseUnits("1", 6));

    const executeTx = await koraExecutor.connect(alice).executeBatch([
      {
        amount0: encryptedAmountAlice.handles[0],
        inputProof: encryptedAmountAlice.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyIdAlice,
      },
      {
        amount0: encryptedAmountBob.handles[0],
        inputProof: encryptedAmountBob.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyIdBob,
      },
    ]);

    await executeTx.wait();
    await fhevm.awaitDecryptionOracle();

    const aliceAfter = await getEncryptedBalances(alice);
    const bobAfter = await getEncryptedBalances(bob);

    // Alice should have 0.5 eWETH, Bob should have 0.75 eWETH
    expect(aliceAfter.eWETHBalance).to.be.eq(ethers.parseUnits("0.5", 6));
    expect(bobAfter.eWETHBalance).to.be.eq(ethers.parseUnits("0.75", 6));

    // Alice should have double of bob's eUSDC balance
    expect(aliceAfter.eUSDCBalance).to.be.eq(bobAfter.eUSDCBalance * 2n);
    expect(aliceAfter.eUSDCBalance).to.be.gt(0n);
  });

  it("should not execute one bad intent in batch", async () => {
    const { alice, bob } = signers;
    const { koraExecutor } = env;

    const koraExecutorAddress = await koraExecutor.getAddress();

    const strategyIdAlice = await createStrategy(
      alice,
      "1",
      "0.5",
      Math.round(Date.now() / 1000) + ONE_YEAR_IN_SECONDS,
      ONE_HOUR_IN_SECONDS,
    );
    const strategyIdBob = await createStrategy(
      bob,
      "1",
      "0.25",
      Math.round(Date.now() / 1000) + ONE_YEAR_IN_SECONDS,
      ONE_HOUR_IN_SECONDS,
    );

    const encryptedAmountAlice = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();

    // Bob has a bad intent, where he swaps more eWETH than maxPurchaseAmount
    const encryptedAmountBob = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();

    const aliceBefore = await getEncryptedBalances(alice);
    const bobBefore = await getEncryptedBalances(bob);

    // Before Alice should have 1.5 eWETH: 0.5 from previous swap + 1 from new Mint
    // Before Bob should have 1.75 eWETH: 0.75 from previous swap + 1 from new Mint
    expect(aliceBefore.eWETHBalance).to.be.eq(ethers.parseUnits("1.5", 6));
    expect(bobBefore.eWETHBalance).to.be.eq(ethers.parseUnits("1.75", 6));

    const executeTx = await koraExecutor.connect(alice).executeBatch([
      {
        amount0: encryptedAmountAlice.handles[0],
        inputProof: encryptedAmountAlice.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyIdAlice,
      },
      {
        amount0: encryptedAmountBob.handles[0],
        inputProof: encryptedAmountBob.inputProof,
        intentId: ethers.randomBytes(32),
        strategyId: strategyIdBob,
      },
    ]);

    await executeTx.wait();
    await fhevm.awaitDecryptionOracle();

    const aliceAfter = await getEncryptedBalances(alice);
    const bobAfter = await getEncryptedBalances(bob);

    // Alice should have 1 eWETH, 1.5 - 0.5 = 1
    // Bob should have 1.75 eWETH, 1.75 - 0  as swap should fail
    expect(aliceAfter.eWETHBalance).to.be.eq(ethers.parseUnits("1", 6));
    expect(bobAfter.eWETHBalance).to.be.eq(ethers.parseUnits("1.75", 6));

    // Alice should have 4 times more eUSDC than bob, because she has swapped total 1 eWETH
    // Bob has swapped in total 0.25 eWETH
    // this is not exact due to uniswap fees logic.
    const diff = bobAfter.eUSDCBalance * 4n - aliceAfter.eUSDCBalance;
    expect(diff).to.be.gt(0n).and.lt(1000n);
  });
});

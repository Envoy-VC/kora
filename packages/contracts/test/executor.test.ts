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
    const { weth, eWETH, koraExecutor, eUSDC } = env;

    const koraExecutorAddress = await koraExecutor.getAddress();

    const amount = ethers.parseUnits("1", 6);

    // Step 1: Give Alice some weth, wrap them, approve to KoraExecutor
    await mintMockTokens(weth, alice.address, amount);
    await approveMockTokens(weth, alice, eWETH.target as string, amount);
    await depositMockTokens(eWETH, alice, amount);
    await approveEncryptedToken(eWETH, alice, koraExecutorAddress, amount);

    const salt =
      "0x2167b80e042c1942216f74551a0aaa051f588207ac7098a2032c5d3201d4655f";

    const strategyId = await koraExecutor.computeStrategyId(
      alice.address,
      salt,
    );

    console.log("Strategy ID:", strategyId);

    // Create A Strategy
    await koraExecutor.createStrategy(alice.address, [], salt);

    const encryptedAmount = await fhevm
      .createEncryptedInput(koraExecutorAddress, alice.address)
      .add64(ethers.parseUnits("0.5", 6))
      .encrypt();

    const { clearBalance: eWETHBefore } = await getEncryptedTokenBalance(
      eWETH,
      alice,
    );
    console.log(
      "Alice eWETH Balance Before Execute:",
      ethers.formatUnits(eWETHBefore, 6),
    );
    const { clearBalance: eUSDCBefore } = await getEncryptedTokenBalance(
      eUSDC,
      alice,
    );
    console.log(
      "Alice eUSDC Balance Before Execute:",
      ethers.formatUnits(eUSDCBefore, 6),
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
    console.log(
      "Alice eWETH Balance After Execute:",
      ethers.formatUnits(eWETHAfter, 6),
    );
    const { clearBalance: eUSDCAfter } = await getEncryptedTokenBalance(
      eUSDC,
      alice,
    );

    console.log(
      "Alice eUSDC Balance After Execute:",
      ethers.formatUnits(eUSDCAfter, 6),
    );
  });
});

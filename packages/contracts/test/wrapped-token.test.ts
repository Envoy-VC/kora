import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

import type { EncryptedERC20, MockERC20 } from "../types";
import {
  getEncryptedTokenBalance,
  getSigners,
  getTokenBalance,
  mintMockTokens,
  type Signers,
} from "./helpers";

type Env = {
  usdc: MockERC20;
  eUSDC: EncryptedERC20;
};

async function deployFixture(): Promise<Env> {
  const deployerAddress = (await ethers.getSigners())[0].address;
  const mockTokenFactory = await ethers.getContractFactory("MockERC20");
  const encryptedTokenFactory =
    await ethers.getContractFactory("EncryptedERC20");

  const usdc = await mockTokenFactory.deploy(deployerAddress, "USDC", "USDC");
  await usdc.waitForDeployment();

  const eUSDC = await encryptedTokenFactory.deploy(
    "Encrypted USDC",
    "eUSDC",
    deployerAddress,
    await usdc.getAddress(),
  );
  await eUSDC.waitForDeployment();

  return {
    eUSDC,
    usdc,
  };
}

describe("Wrapped Encrypted Token Tests", () => {
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

  it("should be able to deposit tokens", async () => {
    const aliceAddress = signers.alice.address;

    const { usdc, eUSDC } = env;
    const eUSDCAddress = await eUSDC.getAddress();

    // 1. Mint USDC to Alice
    await mintMockTokens(usdc, aliceAddress, ethers.parseUnits("1000", 6));
    const aliceUSDCBalance = await getTokenBalance(usdc, signers.alice);
    expect(aliceUSDCBalance).to.eq(ethers.parseUnits("1000", 6));

    // 2. Alice Deposits 100 USDC
    // 2.1 Alice approves the EncryptedERC20 Contract to spend her USDC
    let tx = await usdc
      .connect(signers.alice)
      .approve(eUSDCAddress, ethers.parseUnits("100", 6));
    await tx.wait();
    tx = await eUSDC
      .connect(signers.alice)
      .deposit(ethers.parseUnits("100", 6));
    await tx.wait();

    // 3. Read Alice's balance of the WrappedEncryptedToken
    const { clearBalance } = await getEncryptedTokenBalance(
      eUSDCAddress,
      signers.alice,
    );

    expect(clearBalance).to.eq(ethers.parseUnits("100", 6));
    expect(await usdc.balanceOf(aliceAddress)).to.eq(
      ethers.parseUnits("900", 6),
    );
    expect(await usdc.balanceOf(eUSDCAddress)).to.eq(
      ethers.parseUnits("100", 6),
    );
  });

  it("should be able to withdraw tokens", async () => {
    const aliceAddress = signers.alice.address;

    const { usdc, eUSDC } = env;
    const eUSDCAddress = await eUSDC.getAddress();

    // 1. Mint USDC to Alice
    await mintMockTokens(usdc, aliceAddress, ethers.parseUnits("1000", 6));
    const aliceUSDCBalance = await getTokenBalance(usdc, signers.alice);
    expect(aliceUSDCBalance).to.eq(ethers.parseUnits("1000", 6));

    // 2. Alice Deposits 100 USDC
    // 2.1 Alice approves the EncryptedERC20 Contract to spend her USDC
    let tx = await usdc
      .connect(signers.alice)
      .approve(eUSDCAddress, ethers.parseUnits("100", 6));
    await tx.wait();
    tx = await eUSDC
      .connect(signers.alice)
      .deposit(ethers.parseUnits("100", 6));
    await tx.wait();

    // 3. Read Alice's balance of the WrappedEncryptedToken
    const { clearBalance } = await getEncryptedTokenBalance(
      eUSDCAddress,
      signers.alice,
    );

    expect(clearBalance).to.eq(ethers.parseUnits("100", 6));
    expect(await usdc.balanceOf(aliceAddress)).to.eq(
      ethers.parseUnits("900", 6),
    );
    expect(await usdc.balanceOf(eUSDCAddress)).to.eq(
      ethers.parseUnits("100", 6),
    );

    // 4. Alice Withdraws 50 USDC
    tx = await eUSDC
      .connect(signers.alice)
      .withdraw(ethers.parseUnits("50", 6));
    await tx.wait();

    // After Withdraw
    // Alice: 950 USD, 50 eUSD
    // Contract: 50 USD

    // 5. Read Alice's balance of the EncryptedERC20
    const { clearBalance: clearBalanceAfterWithdraw } =
      await getEncryptedTokenBalance(eUSDCAddress, signers.alice);

    const aliceUSDBalanceAfterWithdraw = await getTokenBalance(
      usdc,
      signers.alice,
    );

    expect(clearBalanceAfterWithdraw).to.eq(ethers.parseUnits("50", 6));
    expect(aliceUSDBalanceAfterWithdraw).to.eq(ethers.parseUnits("950", 6));
    expect(await usdc.balanceOf(eUSDCAddress)).to.eq(
      ethers.parseUnits("50", 6),
    );
  });
});

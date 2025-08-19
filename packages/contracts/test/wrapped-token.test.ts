import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

import type {
  EncryptedERC20,
  MockERC20,
  WrappedEncryptedToken,
} from "../types";
import {
  getEncryptedTokenBalance,
  getSigners,
  getTokenBalance,
  type Signers,
} from "./helpers";

type Env = {
  usdc: MockERC20;
  weUSDC: WrappedEncryptedToken;
  eUSDC: EncryptedERC20;
};

async function deployFixture(): Promise<Env> {
  const deployerAddress = (await ethers.getSigners())[0].address;
  const mockTokenFactory = await ethers.getContractFactory("MockERC20");
  const wrappedEncTokenFactory = await ethers.getContractFactory(
    "WrappedEncryptedToken",
  );

  const usdc = await mockTokenFactory.deploy(
    deployerAddress,
    "Wrapped USDC",
    "USDC",
  );
  await usdc.waitForDeployment();

  const weUSDC = await wrappedEncTokenFactory.deploy(
    "Wrapped USDC",
    "USDC",
    await usdc.getAddress(),
  );
  await weUSDC.waitForDeployment();

  const eUSDC = await ethers.getContractAt(
    "EncryptedERC20",
    await weUSDC._underlyingEncryptedToken(),
  );

  return {
    eUSDC,
    usdc,
    weUSDC,
  };
}

describe("Wrapped Encrypted Token", () => {
  let signers: Signers;
  let env: Env;

  before(async () => {
    signers = await getSigners();
  });

  const mintTokens = async (token: MockERC20, to: string, amount: bigint) => {
    const tx = await token.connect(signers.deployer).mint(to, amount);
    await tx.wait();
  };

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

    const { usdc, weUSDC, eUSDC } = env;
    const weUSDCAddress = await weUSDC.getAddress();
    const eUSDCAddress = await eUSDC.getAddress();

    // 1. Mint USDC to Alice
    await mintTokens(usdc, aliceAddress, ethers.parseUnits("1000", 6));
    const aliceUSDCBalance = await getTokenBalance(usdc, signers.alice);
    expect(aliceUSDCBalance).to.eq(ethers.parseUnits("1000", 6));

    // 2. Alice Deposits 100 USDC
    // 2.1 Alice approves the WrappedEncryptedToken contract to spend her USDC
    let tx = await usdc
      .connect(signers.alice)
      .approve(weUSDCAddress, ethers.parseUnits("100", 6));
    await tx.wait();
    tx = await weUSDC
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
    expect(await usdc.balanceOf(weUSDCAddress)).to.eq(
      ethers.parseUnits("100", 6),
    );
  });

  it("should be able to withdraw tokens", async () => {
    const aliceAddress = signers.alice.address;

    const { usdc, weUSDC, eUSDC } = env;
    const weUSDCAddress = await weUSDC.getAddress();
    const eUSDCAddress = await eUSDC.getAddress();

    // 1. Mint USDC to Alice
    await mintTokens(usdc, aliceAddress, ethers.parseUnits("1000", 6));
    const aliceUSDCBalance = await getTokenBalance(usdc, signers.alice);
    expect(aliceUSDCBalance).to.eq(ethers.parseUnits("1000", 6));

    // 2. Alice Deposits 100 USDC
    // 2.1 Alice approves the WrappedEncryptedToken contract to spend her USDC
    let tx = await usdc
      .connect(signers.alice)
      .approve(weUSDCAddress, ethers.parseUnits("100", 6));
    await tx.wait();
    tx = await weUSDC
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
    expect(await usdc.balanceOf(weUSDCAddress)).to.eq(
      ethers.parseUnits("100", 6),
    );

    // 4. Alice Withdraws 50 USDC
    const encryptedAmount = await fhevm
      .createEncryptedInput(eUSDCAddress, signers.alice.address)
      .add64(ethers.parseUnits("50", 6))
      .encrypt();
    tx = await eUSDC
      .connect(signers.alice)
      ["approve(address,bytes32,bytes)"](
        weUSDCAddress,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof,
      );
    await tx.wait();
    tx = await weUSDC
      .connect(signers.alice)
      .withdraw(ethers.parseUnits("50", 6));
    await tx.wait();

    // After Withdraw
    // Alice: 950 USD, 50 eUSD
    // Contract: 50 USD

    // 5. Read Alice's balance of the WrappedEncryptedToken
    const { clearBalance: clearBalanceAfterWithdraw } =
      await getEncryptedTokenBalance(eUSDCAddress, signers.alice);

    const aliceUSDBalanceAfterWithdraw = await getTokenBalance(
      usdc,
      signers.alice,
    );

    expect(clearBalanceAfterWithdraw).to.eq(ethers.parseUnits("50", 6));
    expect(aliceUSDBalanceAfterWithdraw).to.eq(ethers.parseUnits("950", 6));
    expect(await usdc.balanceOf(weUSDCAddress)).to.eq(
      ethers.parseUnits("50", 6),
    );
  });
});

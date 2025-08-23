import { FhevmType } from "@fhevm/hardhat-plugin";
// biome-ignore lint/correctness/noUndeclaredDependencies: safe
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";

import type { EncryptedERC20, MockERC20 } from "../../types";

export type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

export const getTokenBalance = async (
  token: MockERC20,
  signer: HardhatEthersSigner,
) => {
  return await token.connect(signer).balanceOf(signer.address);
};

export const getEncryptedTokenBalance = async (
  token: EncryptedERC20 | string,
  signer: HardhatEthersSigner,
) => {
  let encryptedBalance: string;
  if (typeof token === "string") {
    const contract = await ethers.getContractAt("EncryptedERC20", token);
    encryptedBalance = await contract.connect(signer).balanceOf(signer.address);
  } else {
    encryptedBalance = await token.connect(signer).balanceOf(signer.address);
  }

  try {
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      typeof token === "string" ? token : await token.getAddress(),
      signer,
    );
    return { clearBalance, encryptedBalance };
  } catch (_error: unknown) {
    return { clearBalance: 0n, encryptedBalance: ethers.ZeroHash };
  }
};

export const getSigners = async () => {
  const [deployer, alice, bob]: HardhatEthersSigner[] =
    await ethers.getSigners();

  return { alice, bob, deployer };
};

export const mintMockTokens = async (
  token: MockERC20,
  to: string,
  amount: bigint,
) => {
  const { deployer } = await getSigners();
  const tx = await token.connect(deployer).mint(to, amount);
  await tx.wait();
};

export const approveMockTokens = async (
  token: MockERC20,
  signer: HardhatEthersSigner,
  spender: string,
  amount: bigint,
) => {
  const tx = await token.connect(signer).approve(spender, amount);
  await tx.wait();
};

export const depositMockTokens = async (
  token: EncryptedERC20,
  signer: HardhatEthersSigner,
  amount: bigint,
) => {
  const tx = await token.connect(signer).deposit(amount);
  await tx.wait();
};

export const approveEncryptedToken = async (
  token: EncryptedERC20,
  signer: HardhatEthersSigner,
  spender: string,
  amount: bigint,
) => {
  const enc = await fhevm
    .createEncryptedInput(await token.getAddress(), signer.address)
    .add64(amount)
    .encrypt();
  const tx = await token
    .connect(signer)
    ["approve(address,bytes32,bytes)"](spender, enc.handles[0], enc.inputProof);
  await tx.wait();
};

import { FhevmType } from "@fhevm/hardhat-plugin";
// biome-ignore lint/correctness/noUndeclaredDependencies: safe
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, network } from "hardhat";

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

export async function impersonate(
  address: string,
): Promise<HardhatEthersSigner> {
  await network.provider.send("hardhat_impersonateAccount", [address]);
  return await ethers.getSigner(address);
}

export async function stopImpersonate(address: string): Promise<void> {
  await network.provider.send("hardhat_stopImpersonatingAccount", [address]);
}

interface DecryptHandleProps {
  handle: string;
  contractAddress: string;
  signer: HardhatEthersSigner;
}

export const decryptHandle = async ({
  handle,
  contractAddress,
  signer,
}: DecryptHandleProps) => {
  const keypair = await fhevm.generateKeypair();
  const handleContractPairs = [
    {
      contractAddress: contractAddress,
      handle: handle,
    },
  ];
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10"; // String for consistency
  const contractAddresses = [contractAddress];

  const eip712 = fhevm.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays,
  );

  const signature = await signer.signTypedData(
    eip712.domain,
    {
      // biome-ignore lint/style/useNamingConvention: safe
      UserDecryptRequestVerification:
        eip712.types.UserDecryptRequestVerification,
    },
    eip712.message,
  );

  const result = await fhevm.userDecrypt(
    handleContractPairs,
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    signer.address,
    startTimeStamp,
    durationDays,
  );

  return result[handle];
};

import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

import { getSigners, type Signers } from "../helpers";

describe("Packed Bool Library Tests", () => {
  let signers: Signers;

  before(async () => {
    signers = await getSigners();
  });

  beforeEach(function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
  });

  it("should pack multiple ebools", async () => {
    const { alice } = signers;
    const lib = await ethers.getContractFactory("PackedBoolTests");
    const library = await lib.deploy();

    const array = [false, true, false, true, false, true, false, true, false];

    const res = fhevm.createEncryptedInput(
      library.target as string,
      alice.address,
    );

    for (const val of array) {
      res.addBool(val);
    }

    const encryptedArray = await res.encrypt();

    await library
      .connect(alice)
      .packEbools(encryptedArray.handles, encryptedArray.inputProof);

    await library.connect(alice).unpackEbools();
    await fhevm.awaitDecryptionOracle();
    const unpackedBools = await Promise.all(
      array.map((_, i) => library.unpacked(i)),
    );

    expect(unpackedBools).to.deep.eq(array);
  });
  it("should pack single ebool", async () => {
    const { alice } = signers;
    const lib = await ethers.getContractFactory("PackedBoolTests");
    const library = await lib.deploy();

    const array = [false];

    const res = fhevm.createEncryptedInput(
      library.target as string,
      alice.address,
    );

    for (const val of array) {
      res.addBool(val);
    }

    const encryptedArray = await res.encrypt();

    await library
      .connect(alice)
      .packEbools(encryptedArray.handles, encryptedArray.inputProof);

    await library.connect(alice).unpackEbools();
    await fhevm.awaitDecryptionOracle();
    const unpackedBools = await Promise.all(
      array.map((_, i) => library.unpacked(i)),
    );

    expect(unpackedBools).to.deep.eq(array);
  });
});

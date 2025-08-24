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

    const encArray = [];

    for await (const val of array) {
      const res = await fhevm
        .createEncryptedInput(library.target as string, alice.address)
        .addBool(val)
        .encrypt();
      encArray.push({ handle: res.handles[0], inputProof: res.inputProof });
    }

    await library.connect(alice).packEbools(encArray);
    const packed = await library.packed();

    // console.log("Original:", array);
    // console.log("Packed:", packed);

    await library.connect(alice).unpackEbools();
    await fhevm.awaitDecryptionOracle();
    const unpackedBools = [];
    for (let i = 0; i < array.length; i++) {
      unpackedBools.push(await library.unpacked(i));
    }
    // console.log("Unpacked:", unpackedBools);
  });
});

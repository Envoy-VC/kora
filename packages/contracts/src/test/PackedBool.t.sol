// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/PackedBool.sol";

import {FHE, ebool, euint64, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract PackedBoolTests is SepoliaConfig {
    euint64 public packed;
    uint64 public length;
    bool[] public unpacked;

    struct EboolArray {
        externalEbool handle;
        bytes inputProof;
    }

    function packEbools(externalEbool[] memory externalArray, bytes memory inputProof) public returns (euint64) {
        ebool[] memory arr = new ebool[](externalArray.length);
        for (uint256 i; i < externalArray.length;) {
            arr[i] = FHE.fromExternal(externalArray[i], inputProof);
            unchecked {
                ++i;
            }
        }

        packed = PackedBool.packEboolArray(arr);
        FHE.allowThis(packed);
        FHE.allow(packed, msg.sender);
        length = uint64(externalArray.length);
        return packed;
    }

    function unpackEbools() public {
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(packed);
        FHE.requestDecryption(cts, this.unpackCallback.selector);
    }

    function unpackCallback(uint256 requestId, uint64 _packed, bytes[] memory signatures) public {
        FHE.checkSignatures(requestId, signatures);
        unpacked = PackedBool.unpackBools(_packed, length);
    }
}

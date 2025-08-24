// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint64} from "@fhevm/solidity/lib/FHE.sol";

library PackedBool {
    function packEboolArray(ebool[] memory arr) internal returns (euint64) {
        require(arr.length <= 64, "PackedBool: Cannot pack more than 64 bits");

        euint64 result = FHE.asEuint64(0);

        euint64 zero = FHE.asEuint64(0);
        euint64 one = FHE.asEuint64(1);

        for (uint256 i = 0; i < arr.length; i++) {
            // Convert Ebool -> Euint64 (0 or 1)
            euint64 bit = FHE.select(arr[i], one, zero);

            // Shift to correct position
            euint64 shifted = FHE.shl(bit, uint8(i));

            // OR accumulate
            result = FHE.or(result, shifted);
        }

        return result;
    }

    function unpackBools(uint64 packed, uint256 len) internal pure returns (bool[] memory arr) {
        require(len <= 64, "Cannot unpack more than 64 bits");
        arr = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            arr[i] = ((packed >> i) & 1) == 1;
        }
    }
}

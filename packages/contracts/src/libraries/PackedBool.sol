// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint64} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title PackedBool Library
 * @notice Utility library for efficiently packing and unpacking encrypted boolean arrays using FHE
 * @dev This library provides functions to compress multiple encrypted boolean values into a single
 *      encrypted uint64 and vice versa, enabling efficient storage and manipulation of boolean flags
 *      while maintaining privacy through Fully Homomorphic Encryption (FHE).
 *
 * Boolean Packing Overview:
 * - Packs up to 64 encrypted boolean values into a single encrypted uint64
 * - Each boolean is represented as a single bit (0 or 1) in the packed value
 * - Maintains privacy by keeping all operations in the encrypted domain
 * - Enables efficient batch operations on multiple boolean flags
 *
 * Key Features:
 * - Privacy Preserving: All operations use FHE encrypted types
 * - Space Efficient: Compresses up to 64 booleans into a single uint64
 * - Gas Optimized: Reduces storage costs and gas consumption
 * - Batch Operations: Enables efficient processing of multiple boolean flags
 */
library PackedBool {
    /**
     * @notice Packs an array of encrypted boolean values into a single encrypted uint64
     * @param arr Array of encrypted boolean values to pack (maximum 64 elements)
     * @return euint64 The packed encrypted value containing all boolean flags
     * @dev
     * This function compresses multiple encrypted boolean values into a single encrypted uint64,
     * where each boolean is represented as a single bit in the packed value. The operation
     * maintains privacy by keeping all values encrypted throughout the process.
     *
     * Packing Process:
     * 1. Converts each encrypted boolean to encrypted uint64 (0 or 1)
     * 2. Shifts each bit to its corresponding position in the packed value
     * 3. Accumulates all bits using OR operations
     * 4. Returns the final packed encrypted uint64
     *
     * Bit Position Mapping:
     * - arr[0] → bit 0 (least significant bit)
     * - arr[1] → bit 1
     * - arr[2] → bit 2
     * - ... and so on up to arr[63] → bit 63
     *
     * Implementation Details:
     * - Uses FHE.select() for conditional conversion (ebool → euint64)
     * - FHE.shl() for bit shifting operations
     * - FHE.or() for bit accumulation
     * - Maintains encryption throughout all operations
     */
    function packEboolArray(ebool[] memory arr) internal returns (euint64) {
        require(arr.length <= 64, "PackedBool: Cannot pack more than 64 bits");

        euint64 result = FHE.asEuint64(0);

        euint64 zero = FHE.asEuint64(0);
        euint64 one = FHE.asEuint64(1);

        for (uint256 i; i < arr.length;) {
            euint64 bit = FHE.select(arr[i], one, zero);
            euint64 shifted = FHE.shl(bit, uint8(i));
            result = FHE.or(result, shifted);
            unchecked {
                ++i;
            }
        }

        return result;
    }

    /**
     * @notice Unpacks a packed uint64 value back into an array of boolean values
     * @param packed The packed uint64 value to unpack
     * @param len The number of boolean values to extract (must not exceed 64)
     * @return arr Array of boolean values extracted from the packed value
     * @dev
     * This function extracts individual boolean values from a packed uint64 by examining
     * each bit position and converting it back to a boolean value. This is useful for
     * retrieving individual flags from a previously packed boolean array.
     *
     * Unpacking Process:
     * 1. Creates a new boolean array of the specified length
     * 2. Iterates through each bit position (0 to len-1)
     * 3. Extracts each bit using bitwise AND and right shift operations
     * 4. Converts each bit to a boolean value (0 = false, 1 = true)
     * 5. Returns the array of extracted boolean values
     *
     * Bit Position Mapping:
     * - bit 0 → arr[0] (least significant bit)
     * - bit 1 → arr[1]
     * - bit 2 → arr[2]
     * - ... and so on up to bit (len-1) → arr[len-1]
     *
     * Implementation Details:
     * - Uses bitwise AND (&) to extract individual bits
     * - Right shift (>>) operations to position bits correctly
     * - Comparison with 1 to convert bits to boolean values
     * - Pure function with no state modifications
     */
    function unpackBools(uint64 packed, uint256 len) internal pure returns (bool[] memory arr) {
        require(len <= 64, "PackedBool: Cannot unpack more than 64 bits");
        arr = new bool[](len);

        for (uint256 i; i < len;) {
            arr[i] = (packed >> i) & 1 == 1;
            unchecked {
                ++i;
            }
        }
    }
}

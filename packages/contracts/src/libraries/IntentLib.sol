// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title IntentLib Library
 * @notice Utility library for managing and manipulating Intent structures in the Kora
 * @dev This library provides the core data structures and encoding/decoding functions for intents,
 *      which represent individual swap operations within a strategy. It handles both external
 *      intents (with proofs) and internal intents (for processing).
 *
 * Intent System Overview:
 * - Intents represent individual swap operations within a strategy
 * - External intents include cryptographic proofs for validation
 * - Internal intents are processed by the executor after validation
 * - Encoding/decoding enables efficient storage and transmission
 */
library IntentLib {
    /**
     * @title IntentExternal Struct
     * @notice External intent structure containing proof data for validation
     * @dev This struct represents intents as they are submitted by users, including
     *      cryptographic proofs that validate the intent's authenticity and parameters.
     */
    struct IntentExternal {
        /// @dev Unique identifier for the intent, used for tracking and deduplication
        bytes32 intentId;
        /// @dev Identifier linking the intent to its parent strategy
        bytes32 strategyId;
        /// @dev Encrypted amount of token0 to be swapped, using external encrypted type
        externalEuint64 amount0;
        /// @dev Cryptographic proof validating the intent's authenticity and parameters
        bytes inputProof;
    }

    /**
     * @title Intent Struct
     * @notice Internal intent structure for processing after validation
     * @dev This struct represents intents after external validation, ready for
     *      execution by the protocol. It contains the essential data needed
     *      for swap execution without the overhead of proof data.
     */
    struct Intent {
        /// @dev Unique identifier for the intent, used for tracking and deduplication
        bytes32 intentId;
        /// @dev Identifier linking the intent to its parent strategy
        bytes32 strategyId;
        /// @dev Encrypted amount of token0 to be swapped, using internal encrypted type
        euint64 amount0;
    }

    /**
     * @notice Encodes an Intent struct into a compact binary representation
     * @param it The Intent struct to encode
     * @return bytes The encoded binary data representing the intent
     * @dev
     * This function serializes an Intent struct into a compact binary format
     * suitable for storage, transmission, or hashing operations.
     */
    function encode(Intent memory it) internal pure returns (bytes memory) {
        return abi.encode(it.amount0, it.intentId, it.strategyId);
    }

    /**
     * @notice Decodes binary data back into an Intent struct
     * @param raw The encoded binary data to decode
     * @return it The decoded Intent struct
     * @dev
     * This function reconstructs an Intent struct from its binary representation,
     * enabling efficient storage and transmission of intent data.
     */
    function decode(bytes memory raw) internal pure returns (Intent memory it) {
        (it.amount0, it.intentId, it.strategyId) = abi.decode(raw, (euint64, bytes32, bytes32));
    }
}

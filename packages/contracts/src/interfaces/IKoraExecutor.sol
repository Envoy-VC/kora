// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint64, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SwapHook} from "./ISwapHook.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

struct Strategy {
    /// @dev Address of the user who created the strategy
    address user;
    /// @dev Timestamp of the strategy creation
    uint64 timestamp;
    /// @dev Hooks associated with the Strategy
    address[] hooks;
}

struct IntentResult {
    /// @dev Whether the execution was successful or not
    bool success;
    /// @dev Intent Identifier
    bytes32 intentId;
    /// @dev User Address for this Strategy
    address user;
    /// @dev The strategy ID for the Intent
    bytes32 strategyId;
    /// @dev The amount of token0 specified in the Intent
    euint64 amount0;
    /// @dev Whether the pre-hook check was successful
    ebool preHookCheck;
    /// @dev Revert data if the execution failed
    bytes revertData;
}

struct Batch {
    mapping(uint256 => IntentResult) results;
    uint256 totalResults;
    euint64 totalIn;
    bool isPending;
}

interface IKoraExecutor {
    event StrategyCreated(bytes32 indexed strategyId, Strategy strategy);

    function createStrategy(address user, SwapHook[] memory hooks, bytes32 salt) external;
    function executeBatch(IntentLib.IntentExternal[] calldata intents) external;
}

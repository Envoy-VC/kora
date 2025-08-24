// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint64, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SwapHook} from "./ISwapHook.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

/**
 * @title Strategy Struct
 * @notice Represents a complete strategy configuration for automated trading
 * @dev Contains all necessary information to identify and execute a strategy
 */
struct Strategy {
    /// @dev Address of the user who created the strategy
    address user;
    /// @dev Timestamp of the strategy creation
    uint64 timestamp;
    /// @dev Hooks associated with the Strategy
    address[] hooks;
}

/**
 * @title IntentResult Struct
 * @notice Contains the result of executing an individual intent within a batch
 * @dev Used to track success/failure and execution details for each intent
 */
struct IntentResult {
    /// @dev Intent Identifier - unique hash to identify the specific intent
    bytes32 intentId;
    /// @dev User Address for this Strategy - the address that owns the strategy
    address user;
    /// @dev The strategy ID for the Intent - links the intent to its parent strategy
    bytes32 strategyId;
    /// @dev The amount of token0 specified in the Intent - encrypted amount for privacy
    euint64 amount0;
    /// @dev Whether the pre-hook checks was successful - determines if execution should proceed
    ebool preHookCheck;
    /// @dev Revert data if the execution failed - contains error information for debugging
    bytes revertData;
}

/**
 * @title Batch Struct
 * @notice Represents a collection of intents to be executed together
 * @dev Manages the execution state and results of multiple intents in a single transaction
 */
struct Batch {
    /// @dev Mapping of intent index to execution results
    mapping(uint256 => IntentResult) results;
    /// @dev Total number of intents in this batch
    uint256 totalResults;
    /// @dev Total encrypted input amount across all intents in the batch
    euint64 totalIn;
    /// @dev Whether the batch is currently pending execution
    bool isPending;
}

/**
 * @title IKoraExecutor Interface
 * @notice Core interface for the Kora Executor contract that manages strategy creation and batch execution
 * @dev This interface defines the primary functions for creating trading strategies and executing
 *      batches of intents with privacy-preserving features using FHE (Fully Homomorphic Encryption)
 *
 * Key Features:
 * - Strategy Management: Create and manage trading strategies with customizable hooks
 * - Batch Execution: Execute multiple intents atomically for gas efficiency
 * - Privacy: Uses FHE for encrypted amounts and boolean values
 * - Hook System: Modular approach for pre-execution validation and post-execution actions
 *
 * Security Considerations:
 * - All amounts are encrypted using euint64 for privacy
 * - Pre-hook validation ensures intents meet strategy requirements
 * - Batch execution provides atomicity and rollback capabilities
 */
interface IKoraExecutor {
    /**
     * @notice Creates a new DCA strategy for a user
     * @param user The address of the user creating the strategy
     * @param hooks Array of swap hook addresses that define strategy behavior
     * @param salt Unique salt value for deterministic strategy ID generation
     * @dev
     * - Strategy ID is generated using keccak256(abi.encodePacked(user, hooks, salt))
     * - Hooks define validation rules and execution logic for the strategy
     * - Salt ensures unique strategy IDs even with identical parameters
     * - Emits StrategyCreated event upon successful creation
     */
    function createStrategy(address user, SwapHook[] memory hooks, bytes32 salt) external;

    /**
     * @notice Executes a batch of intents atomically
     * @param intents Array of external intent data to execute
     * @dev
     * - All intents in the batch are executed in sequence
     * - If any intent fails, the entire batch reverts (atomic execution)
     * - Pre-hook validation is performed for each intent before execution
     * - Results are stored in the batch mapping for tracking
     * - Gas optimization through batch processing
     */
    function executeBatch(IntentLib.IntentExternal[] calldata intents) external;
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ebool} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title SwapHook Struct
 * @notice Configuration structure for swap hooks that define strategy behavior
 * @dev Contains the hook contract address and initialization data for strategy execution
 *
 * This struct is used to configure modular hooks that can be attached to strategies
 * to provide custom validation logic, execution rules, and post-processing actions.
 */
struct SwapHook {
    /// @dev Address of the hook contract implementing ISwapHook interface
    address hook;
    /// @dev Encoded data for hook initialization and configuration
    bytes data;
}

import {IntentLib} from "../libraries/IntentLib.sol";
import {IntentResult} from "./IKoraExecutor.sol";

/**
 * @title ISwapHook Interface
 * @notice Core interface for swap hooks that provide modular strategy validation and execution logic
 * @dev This interface defines the contract that strategies can use to implement custom behavior
 *      for pre-swap validation, post-swap actions, and initialization logic.
 *
 * Hook System Overview:
 * - Pre-swap validation ensures intents meet strategy requirements before execution
 * - Post-swap actions allow for logging, analytics, or additional processing
 * - Initialization enables hooks to set up strategy-specific state and parameters
 */
interface ISwapHook {
    /**
     * @notice Validates an intent before swap execution
     * @param strategyId The unique identifier of the strategy being executed
     * @param intent The intent data containing swap parameters and amounts
     * @return ebool Encrypted boolean indicating whether the intent is valid
     * @dev
     * This function is called before any swap execution to validate that the intent
     * meets the strategy's requirements and business logic rules.
     *
     * Validation Examples:
     * - Amount limits and frequency restrictions
     * - Time-based execution rules
     * - Token pair restrictions
     * - User balance and allowance checks
     * - Custom business logic validation (e.g., KYC, AML)
     */
    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external returns (ebool);

    /**
     * @notice Executes post-swap actions after successful execution
     * @param strategyId The unique identifier of the executed strategy
     * @param result The execution result containing success status and metadata
     * @dev
     * This function is called after a successful swap execution to perform
     * any necessary post-processing, logging, or state updates.
     *
     * Post-Swap Actions Examples:
     * - Logging execution results for analytics
     * - Updating strategy state or counters
     * - Emitting events for external systems
     * - Triggering notifications or callbacks
     * - Updating user preferences or settings
     */
    function postSwap(bytes32 strategyId, IntentResult memory result) external;

    /**
     * @notice Initializes the hook with strategy-specific configuration
     * @param strategyId The unique identifier of the strategy being initialized
     * @param data Encoded configuration data specific to this hook implementation
     * @dev
     * This function is called when a strategy is created to set up the hook
     * with strategy-specific parameters and initial state.
     *
     * Initialization Examples:
     * - Setting up frequency limits and time windows
     * - Configuring amount thresholds and restrictions
     * - Initializing user preferences and settings
     * - Setting up external service connections
     * - Creating initial state structures
     */
    function initialize(bytes32 strategyId, bytes memory data) external;
}

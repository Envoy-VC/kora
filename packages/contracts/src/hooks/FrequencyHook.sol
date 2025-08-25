// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// FHE Imports
import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

contract FrequencyHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // =============================================================
    //                           CONSTANTS
    // =============================================================
    address public immutable executor;

    // =============================================================
    //                        STATE VARIABLES
    // =============================================================

    /// @notice Frequency of next execution in seconds
    mapping(bytes32 => euint64) public _frequency;
    /// @notice Last executed timestamp in seconds
    mapping(bytes32 => euint64) public _lastExecutedAt;

    // =============================================================
    //                            ERRORS
    // =============================================================

    /// @notice Thrown when the caller is not the executor
    error NotExecutor(address sender);

    // =============================================================
    //                            EVENTS
    // =============================================================

    /**
     * @notice Emitted when the hook is initialized
     * @param strategyId The unique identifier of the strategy being initialized
     * @dev This event is emitted when the hook is initialized and can be used
     */
    event HookInitialized(bytes32 indexed strategyId);

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    constructor(address _executor) {
        executor = payable(_executor);
    }

    function initialize(bytes32 strategyId, bytes memory data) external onlyExecutor {
        (address user, externalEuint64 externalFrequency, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 frequency = FHE.fromExternal(externalFrequency, proof);
        FHE.isSenderAllowed(frequency);

        _frequency[strategyId] = frequency;
        FHE.allowThis(_frequency[strategyId]);
        FHE.allow(_frequency[strategyId], user);

        _lastExecutedAt[strategyId] = FHE.asEuint64(0);
        FHE.allowThis(_lastExecutedAt[strategyId]);
        FHE.allow(_lastExecutedAt[strategyId], user);

        emit HookInitialized(strategyId);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata) external onlyExecutor returns (ebool) {
        euint64 minNextExecute = FHE.add(_lastExecutedAt[strategyId], _frequency[strategyId]);

        ebool isAllowed = FHE.ge(FHE.asEuint64(uint64(block.timestamp)), minNextExecute);
        FHE.allow(isAllowed, address(executor));

        // Update last executed timestamp
        _lastExecutedAt[strategyId] = FHE.asEuint64(uint64(block.timestamp));
        FHE.allowThis(_lastExecutedAt[strategyId]);
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external onlyExecutor {
        FHE.allow(_lastExecutedAt[strategyId], result.user);
    }

    function updateFrequency(bytes32 strategyId, euint64 newFrequency) external {
        FHE.isSenderAllowed(_frequency[strategyId]);

        _frequency[strategyId] = newFrequency;
        FHE.allowThis(_frequency[strategyId]);
        FHE.allow(_frequency[strategyId], msg.sender);
    }

    // =============================================================
    //                           MODIFIERS
    // =============================================================

    /**
     * @notice Modifier to check if caller is executor
     * @dev Reverts if caller is not executor
     */
    modifier onlyExecutor() {
        if (msg.sender != executor) revert NotExecutor(msg.sender);
        _;
    }
}

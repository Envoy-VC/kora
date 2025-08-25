// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// FHE Imports
import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

contract BudgetHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // =============================================================
    //                           CONSTANTS
    // =============================================================
    address public immutable executor;

    // =============================================================
    //                        STATE VARIABLES
    // =============================================================

    mapping(bytes32 => euint64) public maxBudget;
    mapping(bytes32 => euint64) public spent;

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
        euint64 zero = FHE.asEuint64(0);

        (address user, externalEuint64 externalMaxBudget, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 _maxBudget = FHE.fromExternal(externalMaxBudget, proof);
        FHE.isSenderAllowed(_maxBudget);

        maxBudget[strategyId] = _maxBudget;
        FHE.allowThis(maxBudget[strategyId]);
        FHE.allow(maxBudget[strategyId], user);

        spent[strategyId] = zero;
        FHE.allowThis(spent[strategyId]);
        FHE.allow(spent[strategyId], user);

        emit HookInitialized(strategyId);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external onlyExecutor returns (ebool) {
        euint64 currentSpent = spent[strategyId];

        euint64 spentAfterSwap = FHE.add(currentSpent, intent.amount0);
        ebool isAllowed = FHE.le(spentAfterSwap, maxBudget[strategyId]);
        FHE.allow(isAllowed, address(executor));

        // Only Update the spent amount if the swap is allowed
        // Because the swap is not allowed, the swap would not be executed in the batch.
        euint64 updatedAmount = FHE.select(isAllowed, spentAfterSwap, currentSpent);
        spent[strategyId] = updatedAmount;
        FHE.allowThis(spent[strategyId]);

        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external onlyExecutor {
        FHE.allow(spent[strategyId], result.user);
    }

    function updateMaxBudget(bytes32 strategyId, externalEuint64 externalMaxBudget, bytes memory proof) external {
        FHE.isSenderAllowed(maxBudget[strategyId]);
        euint64 newMaxBudget = FHE.fromExternal(externalMaxBudget, proof);

        maxBudget[strategyId] = newMaxBudget;
        FHE.allowThis(maxBudget[strategyId]);
        FHE.allow(maxBudget[strategyId], msg.sender);
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

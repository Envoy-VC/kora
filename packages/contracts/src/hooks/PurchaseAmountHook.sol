// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// FHE Imports
import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

contract PurchaseAmountHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // =============================================================
    //                           CONSTANTS
    // =============================================================
    address public immutable executor;

    // =============================================================
    //                        STATE VARIABLES
    // =============================================================

    /// @notice Max amount of token0 to purchase per transaction
    mapping(bytes32 => euint64) public _maxPurchaseAmount;

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
        (address user, externalEuint64 externalMaxPurchaseAmount, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 maxPurchaseAmount = FHE.fromExternal(externalMaxPurchaseAmount, proof);
        FHE.isSenderAllowed(maxPurchaseAmount);

        _maxPurchaseAmount[strategyId] = maxPurchaseAmount;
        FHE.allowThis(_maxPurchaseAmount[strategyId]);
        FHE.allow(_maxPurchaseAmount[strategyId], user);

        emit HookInitialized(strategyId);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external onlyExecutor returns (ebool) {
        euint64 maxAmount = _maxPurchaseAmount[strategyId];

        ebool isAllowed = FHE.le(intent.amount0, maxAmount);
        FHE.allow(isAllowed, address(executor));
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external onlyExecutor {}

    function updateMaxPurchaseAmount(bytes32 strategyId, euint64 newMaxPurchaseAmount) external {
        FHE.isSenderAllowed(_maxPurchaseAmount[strategyId]);

        _maxPurchaseAmount[strategyId] = newMaxPurchaseAmount;
        FHE.allowThis(_maxPurchaseAmount[strategyId]);
        FHE.allow(_maxPurchaseAmount[strategyId], msg.sender);
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

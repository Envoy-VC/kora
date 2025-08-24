// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// FHE Imports
import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

contract TimeframeHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // =============================================================
    //                           CONSTANTS
    // =============================================================
    address public immutable executor;

    // =============================================================
    //                        STATE VARIABLES
    // =============================================================

    /// @notice Timestamp until which the strategy is valid
    mapping(bytes32 => euint64) public _validUntil;

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
        (address user, externalEuint64 externalValidUntil, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 validUntil = FHE.fromExternal(externalValidUntil, proof);
        FHE.isSenderAllowed(validUntil);

        _validUntil[strategyId] = validUntil;
        FHE.allowThis(_validUntil[strategyId]);
        FHE.allow(_validUntil[strategyId], user);

        emit HookInitialized(strategyId);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata) external onlyExecutor returns (ebool) {
        euint64 validUntil = _validUntil[strategyId];

        ebool isAllowed = FHE.le(FHE.asEuint64(uint64(block.timestamp)), validUntil);
        FHE.allow(isAllowed, address(executor));
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external onlyExecutor {}

    function updateValidUntil(bytes32 strategyId, euint64 newValidUntil) external {
        FHE.isSenderAllowed(_validUntil[strategyId]);

        _validUntil[strategyId] = newValidUntil;
        FHE.allowThis(_validUntil[strategyId]);
        FHE.allow(_validUntil[strategyId], msg.sender);
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// FHE Imports
import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

import {KoraExecutor} from "../KoraExecutor.sol";

contract BudgetHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    mapping(bytes32 => euint64) public _maxBudget;
    mapping(bytes32 => euint64) public _spent;

    KoraExecutor public immutable executor;

    constructor(address _executor) {
        executor = KoraExecutor(_executor);
    }

    function initialize(bytes32 strategyId, bytes memory data) external {
        euint64 zero = FHE.asEuint64(0);

        (address user, externalEuint64 externalMaxBudget, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 maxBudget = FHE.fromExternal(externalMaxBudget, proof);
        FHE.isSenderAllowed(maxBudget);

        _maxBudget[strategyId] = maxBudget;
        FHE.allowThis(_maxBudget[strategyId]);
        FHE.allow(_maxBudget[strategyId], user);

        _spent[strategyId] = zero;
        FHE.allowThis(_spent[strategyId]);
        FHE.allow(_spent[strategyId], user);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external returns (ebool) {
        euint64 currentSpent = _spent[strategyId];

        euint64 spentAfterSwap = FHE.add(currentSpent, intent.amount0);
        ebool isAllowed = FHE.le(spentAfterSwap, _maxBudget[strategyId]);
        FHE.allow(isAllowed, address(executor));
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external {
        euint64 spentAfterSwap = FHE.add(_spent[strategyId], result.amount0);
        _spent[strategyId] = spentAfterSwap;
        FHE.allowThis(_spent[strategyId]);
        FHE.allow(_spent[strategyId], result.user);
    }
}

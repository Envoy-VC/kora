// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import "hardhat/console.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

import {KoraExecutor} from "../KoraExecutor.sol";

contract PurchaseAmountHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    mapping(bytes32 => euint64) public _maxPurchaseAmount;

    KoraExecutor public immutable executor;

    constructor(address _executor) {
        executor = KoraExecutor(_executor);
    }

    function initialize(bytes32 strategyId, bytes memory data) external {
        (address user, externalEuint64 externalMaxPurchaseAmount, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 maxPurchaseAmount = FHE.fromExternal(externalMaxPurchaseAmount, proof);
        FHE.isSenderAllowed(maxPurchaseAmount);

        _maxPurchaseAmount[strategyId] = maxPurchaseAmount;
        FHE.allowThis(_maxPurchaseAmount[strategyId]);
        FHE.allow(_maxPurchaseAmount[strategyId], user);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external returns (ebool) {
        euint64 maxAmount = _maxPurchaseAmount[strategyId];

        ebool isAllowed = FHE.le(intent.amount0, maxAmount);
        FHE.allow(isAllowed, address(executor));
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external {}
}

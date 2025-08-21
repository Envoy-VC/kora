// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

import {KoraExecutor} from "../KoraExecutor.sol";

contract TimeframeHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    mapping(bytes32 => euint64) public _validUntil;

    KoraExecutor public immutable executor;

    constructor(address _executor) {
        executor = KoraExecutor(_executor);
    }

    function initialize(bytes32 strategyId, bytes memory data) external {
        (address user, externalEuint64 externalValidUntil, bytes memory proof) =
            abi.decode(data, (address, externalEuint64, bytes));

        euint64 validUntil = FHE.fromExternal(externalValidUntil, proof);
        FHE.isSenderAllowed(validUntil);

        _validUntil[strategyId] = validUntil;
        FHE.allowThis(_validUntil[strategyId]);
        FHE.allow(_validUntil[strategyId], user);
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata) external returns (ebool) {
        euint64 validUntil = _validUntil[strategyId];

        ebool isAllowed = FHE.le(FHE.asEuint64(uint64(block.timestamp)), validUntil);
        FHE.allow(isAllowed, address(executor));
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external {}
}

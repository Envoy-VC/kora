// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import {IntentResult} from "../interfaces/IKoraExecutor.sol";

import "hardhat/console.sol";

import {IntentLib} from "../libraries/IntentLib.sol";

import {KoraExecutor} from "../KoraExecutor.sol";

contract FrequencyHook is ISwapHook, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // Frequency(in seconds). How many seconds after next execute should happen.
    mapping(bytes32 => euint64) public _frequency;
    // Last Executed At timestamp in seconds
    mapping(bytes32 => euint64) public _lastExecutedAt;

    KoraExecutor public immutable executor;

    constructor(address _executor) {
        executor = KoraExecutor(_executor);
    }

    function initialize(bytes32 strategyId, bytes memory data) external {
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
    }

    function preSwap(bytes32 strategyId, IntentLib.Intent calldata) external returns (ebool) {
        euint64 minNextExecute = FHE.add(_lastExecutedAt[strategyId], _frequency[strategyId]);

        ebool isAllowed = FHE.ge(FHE.asEuint64(uint64(block.timestamp)), minNextExecute);
        FHE.allow(isAllowed, address(executor));
        return isAllowed;
    }

    function postSwap(bytes32 strategyId, IntentResult memory result) external {
        _lastExecutedAt[strategyId] = FHE.asEuint64(uint64(block.timestamp));
        FHE.allowThis(_lastExecutedAt[strategyId]);
        FHE.allow(_lastExecutedAt[strategyId], result.user);
    }
}

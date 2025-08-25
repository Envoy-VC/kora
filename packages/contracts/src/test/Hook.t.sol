// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, ebool, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {ISwapHook} from "../interfaces/ISwapHook.sol";
import "../interfaces/IKoraExecutor.sol";

import "../libraries/IntentLib.sol";

contract HookTests is SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    event PreSwapResult(ebool result);

    function initialize(bytes32 strategyId, bytes memory data, address hookAddress) external {
        ISwapHook hook = ISwapHook(hookAddress);
        hook.initialize(strategyId, data);
    }

    function preSwap(bytes32 strategyId, IntentLib.IntentExternal memory intentExternal, address hookAddress)
        external
        returns (ebool)
    {
        ISwapHook hook = ISwapHook(hookAddress);
        euint64 amount0 = FHE.fromExternal(intentExternal.amount0, intentExternal.inputProof);
        FHE.allow(amount0, hookAddress);
        IntentLib.Intent memory intent = IntentLib.Intent({
            amount0: FHE.fromExternal(intentExternal.amount0, intentExternal.inputProof),
            intentId: intentExternal.intentId,
            strategyId: intentExternal.strategyId
        });
        ebool result = hook.preSwap(strategyId, intent);
        FHE.allow(result, msg.sender);
        emit PreSwapResult(result);
        return result;
    }

    struct IntentResultExternal {
        bytes32 intentId;
        address user;
        bytes32 strategyId;
        externalEuint64 handle;
        externalEbool externalCheck;
        bytes inputProof;
        bytes revertData;
    }

    function postSwap(bytes32 strategyId, IntentResultExternal memory intentResultExternal, address hookAddress)
        external
    {
        euint64 amount0 = FHE.fromExternal(intentResultExternal.handle, intentResultExternal.inputProof);
        FHE.allow(amount0, hookAddress);
        ebool check = FHE.fromExternal(intentResultExternal.externalCheck, intentResultExternal.inputProof);
        FHE.allow(check, hookAddress);

        IntentResult memory intentResult = IntentResult({
            amount0: amount0,
            intentId: intentResultExternal.intentId,
            preHookCheck: check,
            revertData: intentResultExternal.revertData,
            strategyId: intentResultExternal.strategyId,
            user: intentResultExternal.user
        });
        ISwapHook hook = ISwapHook(hookAddress);
        hook.postSwap(strategyId, intentResult);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct SwapHook {
    address hook;
    bytes data;
}

import {IntentLib} from "../libraries/IntentLib.sol";
import {ExecutionResult} from "./IKoraExecutor.sol";

interface ISwapHook {
    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external view;
    function postSwap(bytes32 strategyId, ExecutionResult memory result) external;
    function initialize(bytes32 strategyId, bytes memory data) external;
}

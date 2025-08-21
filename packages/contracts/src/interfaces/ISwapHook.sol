// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ebool} from "@fhevm/solidity/lib/FHE.sol";

struct SwapHook {
    address hook;
    bytes data;
}

import {IntentLib} from "../libraries/IntentLib.sol";
import {IntentResult} from "./IKoraExecutor.sol";

interface ISwapHook {
    function preSwap(bytes32 strategyId, IntentLib.Intent calldata intent) external returns (ebool);
    function postSwap(bytes32 strategyId, IntentResult memory result) external;
    function initialize(bytes32 strategyId, bytes memory data) external;
}

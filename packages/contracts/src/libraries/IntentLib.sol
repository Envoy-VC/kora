// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

library IntentLib {
    struct Intent {
        bytes32 intentId;
        bytes32 strategyId;
        externalEuint64 amount0;
        bytes inputProof;
    }

    function encode(Intent calldata it) internal pure returns (bytes memory) {
        return abi.encode(it.intentId, it.strategyId, it.amount0, it.inputProof);
    }

    function decode(bytes calldata raw) internal pure returns (Intent memory it) {
        (it.intentId, it.strategyId, it.amount0, it.inputProof) =
            abi.decode(raw, (bytes32, bytes32, externalEuint64, bytes));
    }
}

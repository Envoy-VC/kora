// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";

library IntentLib {
    struct IntentExternal {
        bytes32 intentId;
        bytes32 strategyId;
        externalEuint64 amount0;
        bytes inputProof;
    }

    struct Intent {
        bytes32 intentId;
        bytes32 strategyId;
        euint64 amount0;
    }

    function encode(Intent memory it) internal pure returns (bytes memory) {
        return abi.encode(it.amount0, it.intentId, it.strategyId);
    }

    function decode(bytes memory raw) internal pure returns (Intent memory it) {
        (it.amount0, it.intentId, it.strategyId) = abi.decode(raw, (euint64, bytes32, bytes32));
    }
}

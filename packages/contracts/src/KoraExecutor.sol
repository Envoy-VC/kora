// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

import {EncryptedERC20} from "./token/EncryptedERC20.sol";

// Interfaces
import "./interfaces/IKoraExecutor.sol";
import "./interfaces/ISwapHook.sol";

// Libraries
import "./libraries/IntentLib.sol";

contract KoraExecutor is IKoraExecutor {
    using IntentLib for IntentLib.Intent;

    EncryptedERC20 public immutable token0;
    EncryptedERC20 public immutable token1;

    mapping(bytes32 => Strategy) public _strategies;

    mapping(uint256 => Batch) public _batches;

    // ---------------------------
    //          Errors
    // ---------------------------

    error BatchAlreadyCompleted();

    // ---------------------------
    //          Events
    // ---------------------------

    event HookFailed(bytes32 intentId, bytes32 indexed strategyId, address indexed hook, bytes revertData);
    event IntentAccepted(bytes32 intentId, bytes32 indexed strategyId, address indexed user);
    event IntentRejected(bytes32 intentId, bytes32 indexed strategyId, address indexed user, bytes revertData);
    event BatchRequested(uint256 indexed requestId);

    function createStrategy(address user, SwapHook[] memory hooks, bytes32 salt) external {
        uint256 len = hooks.length;
        address[] memory hookAddresses = new address[](len);
        bytes32 strategyId = keccak256(abi.encodePacked(user, token0, token1, salt));

        for (uint256 i; i < len;) {
            hookAddresses[i] = hooks[i].hook;
            ISwapHook(hooks[i].hook).initialize(strategyId, hooks[i].data);
            unchecked {
                ++i;
            }
        }

        Strategy memory _strategy = Strategy({user: user, timestamp: uint64(block.timestamp), hooks: hookAddresses});
        _strategies[strategyId] = _strategy;

        emit StrategyCreated(strategyId, _strategy);
    }

    function executeBatch(IntentLib.Intent[] calldata intents) external {
        uint256 len = intents.length;
        ExecutionResult[] memory results = new ExecutionResult[](len);

        euint64 totalIn = FHE.asEuint64(0);

        // 1. Validate via hooks & pull funds for successes
        for (uint256 i; i < len;) {
            IntentLib.Intent calldata intent = intents[i];

            Strategy memory strategy = _strategies[intent.strategyId];

            euint64 intentAmount = FHE.fromExternal(intent.amount0, intent.inputProof);

            // 1.1 Check for Non-existent Strategy
            if (strategy.user == address(0)) {
                bytes memory reason = abi.encodePacked("KoraExecutor: Strategy not found");
                results[i] = ExecutionResult(false, intent.strategyId, intentAmount, (reason));
                emit IntentRejected(intent.intentId, intent.strategyId, address(0), reason);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.2 Run Isolated Hooks, failure in any hook will reject the Intent, not the entire batch
            address[] memory hooks = strategy.hooks;
            bool okHooks = _runPreHooks(hooks, intent); // TODO: Implement
            if (!okHooks) {
                bytes memory reason = abi.encodePacked("KoraExecutor: Hook failure");
                results[i] = ExecutionResult(false, intent.strategyId, intentAmount, (reason));
                emit IntentRejected(intent.intentId, intent.strategyId, strategy.user, reason);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.3 Pull in EncryptedERC20 tokens from Strategy User to this contract
            (bool pullSuccess, bytes memory pullResult) = _pullIn(strategy.user, intentAmount);
            if (!pullSuccess) {
                results[i] = ExecutionResult(false, intent.strategyId, intentAmount, (pullResult));
                emit IntentRejected(intent.intentId, intent.strategyId, strategy.user, pullResult);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.4 Mark Success and Add to Total Amount
            results[i] = ExecutionResult(true, intent.strategyId, intentAmount, (bytes("")));
            totalIn = FHE.add(totalIn, intentAmount);

            emit IntentAccepted(intent.intentId, intent.strategyId, strategy.user);

            unchecked {
                ++i;
            }
        }

        // 2. Request Decryption of Total Amount from Decryption Oracle
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(totalIn);
        uint256 latestRequestId = FHE.requestDecryption(cts, this._decryptionCallback.selector);

        _batches[latestRequestId].totalResults = len;
        _batches[latestRequestId].totalIn = totalIn;
        _batches[latestRequestId].isPending = true;

        for (uint256 i; i < len;) {
            _batches[latestRequestId].results[i] = results[i];
            unchecked {
                ++i;
            }
        }

        emit BatchRequested(latestRequestId);
    }

    function _decryptionCallback(uint256 requestId, uint256 totalIn, bytes[] memory signatures) public {
        Batch storage batch = _batches[requestId];

        if (!batch.isPending) {
            revert BatchAlreadyCompleted();
        }
        FHE.checkSignatures(requestId, signatures);

        // TODO: Perform Total Swap and distribute rewards.

        batch.isPending = false;
    }

    function _runPreHooks(address[] memory hooks, IntentLib.Intent calldata intent) internal returns (bool) {
        uint256 hooksLen = hooks.length;
        if (hooksLen == 0) return true;

        bytes memory encodedIntent = intent.encode();
        for (uint256 j; j < hooksLen;) {
            address hook = hooks[j];

            // Check For Zero Address
            bool isContract = _isContract(hook);
            if (hook == address(0)) {
                emit HookFailed(
                    intent.intentId, intent.strategyId, hook, abi.encodePacked("KoraExecutor: ZeroAddress Hook")
                );
                return false;
            }

            // Check For Contracts
            if (!isContract) {
                emit HookFailed(
                    intent.intentId, intent.strategyId, hook, abi.encodePacked("KoraExecutor: Hook not a Contract")
                );
                return false;
            }

            (bool ok, bytes memory result) =
                hook.call(abi.encodeWithSelector(ISwapHook.preSwap.selector, intent.strategyId, encodedIntent));

            if (!ok) {
                emit HookFailed(intent.intentId, intent.strategyId, hook, result);
                return false;
            }

            unchecked {
                ++j;
            }
        }

        return true;
    }

    function _pullIn(address from, euint64 amount) private returns (bool ok, bytes memory result) {
        // 0xb3feb580 = last4Bytes(keccak256("transferFrom(address,address,euint64)"))
        bytes memory data = abi.encodeWithSelector(0xb3feb580, from, address(this), amount);
        (ok, result) = address(token0).call(data);
    }

    function _isContract(address account) internal view returns (bool result) {
        assembly {
            result := gt(extcodesize(account), 0)
        }
    }
}

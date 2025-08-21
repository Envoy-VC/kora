// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

// Uniswap V2
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

// Token
import {EncryptedERC20} from "./token/EncryptedERC20.sol";

import "hardhat/console.sol";

// Interfaces
import "./interfaces/IKoraExecutor.sol";
import "./interfaces/ISwapHook.sol";

// Libraries
import "./libraries/IntentLib.sol";

contract KoraExecutor is IKoraExecutor, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // -----------------------------------------------------------
    //                      State Variables
    // -----------------------------------------------------------

    EncryptedERC20 public immutable token0;
    EncryptedERC20 public immutable token1;

    IUniswapV2Router02 public immutable router;

    mapping(bytes32 => Strategy) public _strategies;
    mapping(uint256 => Batch) public _batches;

    // -----------------------------------------------------------
    //                          Errors
    // -----------------------------------------------------------

    error ZeroAddressHook();
    error HookNotAContract();
    error BatchAlreadyCompleted();
    error NonExistentBatch();

    // -----------------------------------------------------------
    //                          Events
    // -----------------------------------------------------------

    event HookFailed(bytes32 intentId, bytes32 indexed strategyId, address indexed hook, bytes revertData);
    event IntentAccepted(bytes32 intentId, bytes32 indexed strategyId, address indexed user);
    event IntentRejected(bytes32 intentId, bytes32 indexed strategyId, address indexed user, bytes revertData);
    event BatchRequested(uint256 indexed requestId);

    // -----------------------------------------------------------
    //                          Constructor
    // -----------------------------------------------------------

    constructor(address _token0, address _token1, address _router) {
        token0 = EncryptedERC20(_token0);
        token1 = EncryptedERC20(_token1);
        router = IUniswapV2Router02(_router);
    }

    // -----------------------------------------------------------
    //                  Public/External Functions
    // -----------------------------------------------------------

    function createStrategy(address user, SwapHook[] memory hooks, bytes32 salt) external {
        uint256 len = hooks.length;
        address[] memory hookAddresses = new address[](len);
        bytes32 strategyId = computeStrategyId(user, salt);

        // Get All Hook Addresses
        for (uint256 i; i < len;) {
            hookAddresses[i] = hooks[i].hook;
            unchecked {
                ++i;
            }
        }

        // Validate Hooks
        _validateHooks(hookAddresses);

        // Initialize each SwapHook
        for (uint256 i; i < len;) {
            ISwapHook(hooks[i].hook).initialize(strategyId, hooks[i].data);
            unchecked {
                ++i;
            }
        }

        Strategy memory _strategy = Strategy({user: user, timestamp: uint64(block.timestamp), hooks: hookAddresses});
        _strategies[strategyId] = _strategy;

        emit StrategyCreated(strategyId, _strategy);
    }

    function executeBatch(IntentLib.IntentExternal[] calldata intents) external {
        uint256 len = intents.length;
        IntentResult[] memory results = new IntentResult[](len);

        // Initialize Total Token Input
        euint64 totalIn = FHE.asEuint64(0);

        // 1. Validate via hooks
        for (uint256 i; i < len;) {
            IntentLib.IntentExternal calldata intent = intents[i];

            Strategy memory strategy = _strategies[intent.strategyId];

            euint64 intentAmount = FHE.fromExternal(intent.amount0, intent.inputProof);

            // 1.1 Check for Non-existent Strategy
            if (strategy.user == address(0)) {
                bytes memory reason = abi.encodePacked("KoraExecutor: Strategy not found");
                results[i] = IntentResult(
                    intent.intentId, strategy.user, intent.strategyId, intentAmount, FHE.asEbool(false), false, reason
                );
                emit IntentRejected(intent.intentId, intent.strategyId, strategy.user, reason);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.2 Run Isolated Hooks and get ebool results
            address[] memory hooks = strategy.hooks;
            ebool preHookCheck = _runPreHooks(
                hooks,
                IntentLib.Intent({amount0: intentAmount, intentId: intent.intentId, strategyId: intent.strategyId})
            );

            // 1.3 Check for Allowance
            ebool hasPassedChecks = preHookCheck;

            // 1.3 Pull in EncryptedERC20 tokens from Strategy User to this contract
            (bool pullSuccess, bytes memory pullResult) = _pullIn(strategy.user, intentAmount);
            console.log("Pull Status:", pullSuccess);

            if (!pullSuccess) {
                results[i] = IntentResult(
                    intent.intentId, strategy.user, intent.strategyId, intentAmount, hasPassedChecks, false, pullResult
                );
                emit IntentRejected(intent.intentId, intent.strategyId, strategy.user, pullResult);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.3 Mark Success and Add to Total Token Input
            results[i] = IntentResult(
                intent.intentId, strategy.user, intent.strategyId, intentAmount, hasPassedChecks, true, bytes("")
            );

            // 1.4 Add only if hasPassedChecks is successful
            euint64 toAdd = FHE.select(hasPassedChecks, intentAmount, FHE.asEuint64(0));
            euint64 runningTotal = FHE.add(totalIn, toAdd);
            totalIn = runningTotal;

            emit IntentAccepted(intent.intentId, intent.strategyId, strategy.user);

            unchecked {
                ++i;
            }
        }

        // 2. Request Decryption of Total Amount from Decryption Oracle
        bytes32[] memory cts = new bytes32[](1 + len);
        cts[0] = FHE.toBytes32(totalIn);
        for (uint256 i; i < len;) {
            cts[i + 1] = FHE.toBytes32(results[i].hasPassedChecks);
            unchecked {
                ++i;
            }
        }
        uint256 latestRequestId = _requestDecryption(cts);

        _batches[latestRequestId].totalResults = len;
        _batches[latestRequestId].totalIn = totalIn;
        _batches[latestRequestId].isPending = true;

        for (uint256 i; i < len;) {
            _batches[latestRequestId].results[i] = results[i];
            FHE.allowThis(results[i].amount0);
            unchecked {
                ++i;
            }
        }

        console.log("Batch Requested");
        emit BatchRequested(latestRequestId);
    }

    function decryptionCallback1(uint256 requestId, uint64 totalIn, bool preHookCheck1, bytes[] memory signatures)
        public
    {
        bool[] memory preHookChecks = new bool[](1);
        preHookChecks[0] = preHookCheck1;

        _decryptionCallback(requestId, totalIn, preHookChecks, signatures);
    }

    function decryptionCallback2(
        uint256 requestId,
        uint64 totalIn,
        bool preHookCheck1,
        bool preHookCheck2,
        bytes[] memory signatures
    ) public {
        bool[] memory preHookChecks = new bool[](2);
        preHookChecks[0] = preHookCheck1;
        preHookChecks[1] = preHookCheck2;

        _decryptionCallback(requestId, totalIn, preHookChecks, signatures);
    }

    function decryptionCallback3(
        uint256 requestId,
        uint64 totalIn,
        bool preHookCheck1,
        bool preHookCheck2,
        bool preHookCheck3,
        bytes[] memory signatures
    ) public {
        bool[] memory preHookChecks = new bool[](3);
        preHookChecks[0] = preHookCheck1;
        preHookChecks[1] = preHookCheck2;
        preHookChecks[2] = preHookCheck3;

        _decryptionCallback(requestId, totalIn, preHookChecks, signatures);
    }

    function decryptionCallback4(
        uint256 requestId,
        uint64 totalIn,
        bool preHookCheck1,
        bool preHookCheck2,
        bool preHookCheck3,
        bool preHookCheck4,
        bytes[] memory signatures
    ) public {
        bool[] memory preHookChecks = new bool[](4);
        preHookChecks[0] = preHookCheck1;
        preHookChecks[1] = preHookCheck2;
        preHookChecks[2] = preHookCheck3;
        preHookChecks[3] = preHookCheck4;

        _decryptionCallback(requestId, totalIn, preHookChecks, signatures);
    }

    function decryptionCallback5(
        uint256 requestId,
        uint64 totalIn,
        bool preHookCheck1,
        bool preHookCheck2,
        bool preHookCheck3,
        bool preHookCheck4,
        bool preHookCheck5,
        bytes[] memory signatures
    ) public {
        bool[] memory preHookChecks = new bool[](5);
        preHookChecks[0] = preHookCheck1;
        preHookChecks[1] = preHookCheck2;
        preHookChecks[2] = preHookCheck3;
        preHookChecks[3] = preHookCheck4;
        preHookChecks[4] = preHookCheck5;

        _decryptionCallback(requestId, totalIn, preHookChecks, signatures);
    }

    function decryptionCallback6(
        uint256 requestId,
        uint64 totalIn,
        bool preHookCheck1,
        bool preHookCheck2,
        bool preHookCheck3,
        bool preHookCheck4,
        bool preHookCheck5,
        bool preHookCheck6,
        bytes[] memory signatures
    ) public {
        bool[] memory preHookChecks = new bool[](6);
        preHookChecks[0] = preHookCheck1;
        preHookChecks[1] = preHookCheck2;
        preHookChecks[2] = preHookCheck3;
        preHookChecks[3] = preHookCheck4;
        preHookChecks[4] = preHookCheck5;
        preHookChecks[5] = preHookCheck6;

        _decryptionCallback(requestId, totalIn, preHookChecks, signatures);
    }

    function _decryptionCallback(
        uint256 requestId,
        uint64 totalIn,
        bool[] memory preHookChecks,
        bytes[] memory signatures
    ) internal {
        console.log("Callback Called");
        Batch storage batch = _batches[requestId];

        // 1. Check for Valid Signatures
        FHE.checkSignatures(requestId, signatures);

        // 2. Check if the batch is pending
        if (!batch.isPending) {
            revert BatchAlreadyCompleted();
        }
        // 3. Check if the batch exists
        if (batch.totalResults == 0) {
            revert NonExistentBatch();
        }
        console.log("here0");

        // 4. Return cases where pull was true but preCheck was false
        for (uint256 i; i < batch.totalResults;) {
            bool hasPassedChecks = preHookChecks[i];
            bool hasPulledIn = batch.results[i].hasPulledIn;
            if (!hasPassedChecks && hasPulledIn) {
                FHE.allowTransient(batch.results[i].amount0, address(token0));
                token0.transfer(batch.results[i].user, batch.results[i].amount0);
            }
            unchecked {
                ++i;
            }
        }
        console.log("here");

        if (totalIn == 0) return;

        // 5. Withdraw totalIn Token0 for swapping
        token0.withdraw(totalIn);

        // 5. Execute Swap to get Underlying Token1
        uint256 amountOut = _executeSwap(totalIn);

        // 6. Convert Underlying Token1 Amount to Encrypted Token1
        token1._underlyingToken().approve(address(token1), amountOut);
        token1.deposit(uint64(amountOut));

        uint256 len = batch.totalResults;

        // 7. Distribute Tokens proportionally to Users as per their Intent Amounts
        for (uint256 i; i < len;) {
            // 7.1 Check if Intent has passed Checks
            if (!preHookChecks[i]) {
                console.log("Intent did not pass checks");
                unchecked {
                    ++i;
                }
                continue;
            }

            // 7.3 If Intent Amount is Zero, skip
            euint64 intentAmountIn = batch.results[i].amount0;

            // 7.4 Calculate Ratio of Intent Amount to Total Token Input
            euint64 encAmountOut = FHE.asEuint64(uint64(amountOut));
            euint64 ratio = FHE.div(intentAmountIn, totalIn);
            euint64 intentAmountOut = FHE.mul(ratio, encAmountOut);

            // Transfer Encrypted Tokens to User
            address user = _strategies[batch.results[i].strategyId].user;
            FHE.allowTransient(intentAmountOut, address(token1));
            token1.transfer(user, intentAmountOut);

            // Execute Post-Swap Hooks
            address[] memory hooks = _strategies[batch.results[i].strategyId].hooks;
            _executePostHooks(hooks, batch.results[i]);
            unchecked {
                ++i;
            }
        }

        batch.isPending = false;
    }

    function computeStrategyId(address user, bytes32 salt) public view returns (bytes32) {
        return keccak256(abi.encodePacked(user, address(token0), address(token1), salt));
    }

    // -----------------------------------------------------------
    //                  Internal/Private Functions
    // -----------------------------------------------------------

    function _requestDecryption(bytes32[] memory cts) internal returns (uint256) {
        uint256 batchSize = cts.length - 1;
        if (batchSize == 1) {
            return FHE.requestDecryption(cts, this.decryptionCallback1.selector);
        } else if (batchSize == 2) {
            return FHE.requestDecryption(cts, this.decryptionCallback2.selector);
        } else if (batchSize == 3) {
            return FHE.requestDecryption(cts, this.decryptionCallback3.selector);
        } else if (batchSize == 4) {
            return FHE.requestDecryption(cts, this.decryptionCallback4.selector);
        } else if (batchSize == 5) {
            return FHE.requestDecryption(cts, this.decryptionCallback5.selector);
        } else if (batchSize == 6) {
            return FHE.requestDecryption(cts, this.decryptionCallback6.selector);
        }

        revert("KoraExecutor: Invalid Decryption Oracle Request");
    }

    function _executeSwap(uint256 totalIn) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = address(token0._underlyingToken());
        path[1] = address(token1._underlyingToken());

        token0._underlyingToken().approve(address(router), totalIn);

        uint256[] memory results =
            router.swapExactTokensForTokens(totalIn, 0, path, address(this), block.timestamp + 20);

        return results[1];
    }

    function _validateHooks(address[] memory hooks) internal view {
        uint256 hooksLen = hooks.length;

        for (uint256 i; i < hooksLen;) {
            address hook = hooks[i];

            // Check For Zero Address
            if (hook == address(0)) {
                revert ZeroAddressHook();
            }

            // Check For Contracts
            bool isContract = _isContract(hook);

            if (!isContract) {
                revert HookNotAContract();
            }

            unchecked {
                ++i;
            }
        }
    }

    function _runPreHooks(address[] memory hooks, IntentLib.Intent memory intent) internal returns (ebool) {
        uint256 hooksLen = hooks.length;

        ebool res = FHE.asEbool(true);

        bytes memory encodedIntent = intent.encode();
        for (uint256 j; j < hooksLen;) {
            address hook = hooks[j];
            FHE.allowTransient(intent.amount0, hook);

            // Call Pre-Swap Hook
            (bool ok, bytes memory result) =
                hook.call(abi.encodeWithSelector(ISwapHook.preSwap.selector, intent.strategyId, encodedIntent));

            if (!ok) {
                emit HookFailed(intent.intentId, intent.strategyId, hook, result);
                return FHE.asEbool(false);
            }

            (ebool outcome) = abi.decode(result, (ebool));
            res = FHE.and(res, outcome);

            unchecked {
                ++j;
            }
        }

        return res;
    }

    function _executePostHooks(address[] memory hooks, IntentResult memory result) internal {
        uint256 hooksLen = hooks.length;
        if (hooksLen == 0) return;

        for (uint256 j; j < hooksLen;) {
            address hook = hooks[j];
            FHE.allowTransient(result.amount0, hook);

            // Call Post-Swap Hook
            (bool ok, bytes memory res) =
                hook.call(abi.encodeWithSelector(ISwapHook.postSwap.selector, result.strategyId, result));

            if (!ok) {
                emit HookFailed(result.intentId, result.strategyId, hook, res);
            }

            unchecked {
                ++j;
            }
        }
    }

    function _pullIn(address from, euint64 amount) private returns (bool ok, bytes memory result) {
        FHE.allowTransient(amount, address(token0));
        bytes memory data = abi.encodeWithSelector(0xb3c06f50, from, address(this), amount);
        (ok, result) = address(token0).call(data);
    }

    function _contractHasAllowance(address account, euint64 amount) private returns (ebool result) {
        FHE.allowTransient(amount, address(token0));
        euint64 allowance = token0.allowance(account, address(this));
        ebool hasAllowance = FHE.ge(allowance, amount);
        return hasAllowance;
    }

    function _isContract(address account) internal view returns (bool result) {
        assembly {
            result := gt(extcodesize(account), 0)
        }
    }
}

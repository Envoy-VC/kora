// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Uniswap V2
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

// Token
import {EncryptedERC20} from "./token/EncryptedERC20.sol";

// Interfaces
import "./interfaces/IKoraExecutor.sol";
import "./interfaces/ISwapHook.sol";

// Libraries
import "./libraries/IntentLib.sol";
import "./libraries/PackedBool.sol";

contract KoraExecutor is IKoraExecutor, Ownable, SepoliaConfig {
    using IntentLib for IntentLib.Intent;

    // =============================================================
    //                           CONSTANTS
    // =============================================================

    /// @notice Maximum number of intents that can be processed in a single batch
    uint256 public constant MAX_BATCH_SIZE = 64;

    /// @notice Maximum number of hooks allowed per strategy
    uint256 public constant MAX_HOOKS_PER_STRATEGY = 64;

    /// @notice Minimum swap deadline buffer in seconds
    uint256 public constant MIN_SWAP_DEADLINE_BUFFER = 20;

    // =============================================================
    //                        STATE VARIABLES
    // =============================================================

    /// @notice Encrypted ERC20 token for the first asset in trading pairs
    EncryptedERC20 public immutable token0;

    /// @notice Encrypted ERC20 token for the second asset in trading pairs
    EncryptedERC20 public immutable token1;

    /// @notice Uniswap V2 router for executing swaps
    IUniswapV2Router02 public immutable router;

    /// @notice Mapping from strategy ID to strategy details
    mapping(bytes32 => Strategy) public strategies;

    /// @notice Mapping from batch request ID to batch details
    mapping(uint256 => Batch) public batches;

    /// @notice Total number of strategies created
    uint256 public totalStrategies;

    /// @notice Total number of batches processed
    uint256 public totalBatches;

    /// @notice Contract pause state for emergency situations
    bool public paused;

    // =============================================================
    //                            ERRORS
    // =============================================================

    /// @notice Thrown when attempting to use a zero address
    error ZeroAddress();

    /// @notice Thrown when attempting to execute an already completed batch
    error BatchAlreadyCompleted();

    /// @notice Thrown when attempting to access a non-existent batch
    error NonExistentBatch();

    /// @notice Thrown when the batch size exceeds the maximum allowed
    error BatchSizeExceedsMaximum();

    /// @notice Thrown when the number of hooks exceeds the maximum allowed
    error TooManyHooks();

    /// @notice Thrown when the contract is paused
    error ContractPaused();

    /// @notice Thrown when the swap deadline has passed
    error SwapDeadlineExpired();

    /// @notice Thrown when the swap amount is zero
    error ZeroSwapAmount();

    /// @notice Thrown when a address is not a contract
    error NotAContract();

    // =============================================================
    //                            EVENTS
    // =============================================================

    /**
     * @notice Emitted when a new strategy is created
     * @param strategyId The unique identifier for the created strategy
     * @param strategy The complete strategy configuration
     * @dev This event allows external systems to track strategy creation
     */
    event StrategyCreated(bytes32 indexed strategyId, Strategy strategy);

    /**
     * @notice Emitted when a pre-swap hook fails during execution
     * @param intentId Unique identifier for the intent
     * @param strategyId Unique identifier for the strategy
     * @param hook Address of the hook that failed
     * @param revertData Data returned from the failed hook call
     */
    event PreHookFailed(bytes32 indexed intentId, bytes32 indexed strategyId, address indexed hook, bytes revertData);

    /**
     * @notice Emitted when a post-swap hook fails during execution
     * @param intentId Unique identifier for the intent
     * @param strategyId Unique identifier for the strategy
     * @param hook Address of the hook that failed
     * @param revertData Data returned from the failed hook call
     */
    event PostHookFailed(bytes32 indexed intentId, bytes32 indexed strategyId, address indexed hook, bytes revertData);

    /**
     * @notice Emitted when an intent is successfully accepted for processing
     * @param intentId Unique identifier for the intent
     * @param strategyId Unique identifier for the strategy
     * @param user Address of the user who submitted the intent
     */
    event IntentAccepted(bytes32 indexed intentId, bytes32 indexed strategyId, address indexed user);

    /**
     * @notice Emitted when an intent is rejected during processing
     * @param intentId Unique identifier for the intent
     * @param strategyId Unique identifier for the strategy
     * @param user Address of the user who submitted the intent
     * @param revertData Reason for rejection
     */
    event IntentRejected(bytes32 indexed intentId, bytes32 indexed strategyId, address indexed user, bytes revertData);

    /**
     * @notice Emitted when a new batch is requested for processing
     * @param requestId Unique identifier for the batch request
     * @param batchSize Number of intents in the batch
     */
    event BatchRequested(uint256 indexed requestId, uint256 batchSize);

    /**
     * @notice Emitted when a batch is successfully executed
     * @param requestId Unique identifier for the batch request
     * @param totalProcessed Total number of intents processed
     */
    event BatchExecuted(uint256 indexed requestId, uint256 totalProcessed);

    /**
     * @notice Emitted when the contract is paused or unpaused
     * @param paused True if contract is paused, false if unpaused
     * @param caller Address that triggered the pause/unpause
     */
    event PauseStateChanged(bool indexed paused, address indexed caller);

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /**
     * @notice Initializes the KoraExecutor contract
     * @param _token0 Address of the first encrypted ERC20 token
     * @param _token1 Address of the second encrypted ERC20 token
     * @param _router Address of the Uniswap V2 router
     * @dev All parameters must be non-zero addresses and valid contracts
     */
    constructor(address _token0, address _token1, address _router, address initialOwner)
        Ownable(initialOwner)
        SepoliaConfig()
    {
        if (_token0 == address(0)) revert ZeroAddress();
        if (_token1 == address(0)) revert ZeroAddress();
        if (_router == address(0)) revert ZeroAddress();

        if (!_isContract(_token0)) revert NotAContract();
        if (!_isContract(_token1)) revert NotAContract();
        if (!_isContract(_router)) revert NotAContract();

        token0 = EncryptedERC20(_token0);
        token1 = EncryptedERC20(_token1);
        router = IUniswapV2Router02(_router);
    }

    // =============================================================
    //                    PUBLIC/EXTERNAL FUNCTIONS
    // =============================================================

    /**
     * @notice Creates a new DCA strategy for a user
     * @param user Address of the user creating the strategy
     * @param hooks Array of hooks to be associated with the strategy
     * @param salt Unique salt for generating the strategy ID
     * @dev This function creates a new strategy and initializes all associated hooks
     *      The strategy ID is deterministically generated using the user address, token addresses, and salt
     *      Each hook is validated and initialized with the strategy ID
     *
     * Requirements:
     * - User address must not be zero
     * - Hooks array must not exceed MAX_HOOKS_PER_STRATEGY
     * - All hook addresses must be valid contracts
     * - Contract must not be paused
     *
     * @custom:security This function modifies state and should be called with care
     */
    function createStrategy(address user, SwapHook[] memory hooks, bytes32 salt) external whenNotPaused {
        if (user == address(0)) revert ZeroAddress();
        if (hooks.length > MAX_HOOKS_PER_STRATEGY) revert TooManyHooks();

        uint256 len = hooks.length;
        address[] memory hookAddresses = new address[](len);
        bytes32 strategyId = computeStrategyId(user, salt);

        // Check if strategy already exists
        if (strategies[strategyId].user != address(0)) {
            revert("Strategy already exists");
        }

        // Extract and validate hook addresses
        for (uint256 i; i < len;) {
            hookAddresses[i] = hooks[i].hook;
            unchecked {
                ++i;
            }
        }

        // Validate all hooks
        _validateHooks(hookAddresses);

        // Initialize each hook with the strategy ID
        for (uint256 i; i < len;) {
            ISwapHook(hooks[i].hook).initialize(strategyId, hooks[i].data);
            unchecked {
                ++i;
            }
        }

        Strategy memory newStrategy = Strategy({user: user, timestamp: uint64(block.timestamp), hooks: hookAddresses});

        strategies[strategyId] = newStrategy;
        totalStrategies++;

        emit StrategyCreated(strategyId, newStrategy);
    }

    /**
     * @notice Executes a batch of intents through the strategy system
     * @param intents Array of external intents to be processed
     * @dev This function processes multiple intents in a single transaction for gas efficiency
     *      It performs validation, runs pre-hooks, and prepares for batch execution
     *      The actual swap execution happens in the decryption callback
     *
     * Process Flow:
     * 1. Validate all intents and strategies
     * 2. Run pre-hooks for each intent
     * 3. Pull encrypted tokens from users
     * 4. Request decryption from the FHE oracle
     * 5. Store batch information for callback processing
     *
     * Requirements:
     * - Batch size must not exceed MAX_BATCH_SIZE
     * - All intents must reference valid strategies
     * - Contract must not be paused
     */
    function executeBatch(IntentLib.IntentExternal[] calldata intents) external whenNotPaused {
        uint256 batchSize = intents.length;
        if (batchSize == 0) revert("Empty batch");
        if (batchSize > MAX_BATCH_SIZE) revert BatchSizeExceedsMaximum();

        IntentResult[] memory results = new IntentResult[](batchSize);
        euint64 totalIn = FHE.asEuint64(0);

        // Phase 1: Validation and Pre-Hook Execution
        for (uint256 i; i < batchSize;) {
            IntentLib.IntentExternal calldata intent = intents[i];
            Strategy memory strategy = strategies[intent.strategyId];

            euint64 intentAmount = FHE.fromExternal(intent.amount0, intent.inputProof);

            // 1.1 Validate strategy exists
            if (strategy.user == address(0)) {
                bytes memory reason = abi.encodePacked("KoraExecutor: Strategy not found");
                results[i] = IntentResult({
                    intentId: intent.intentId,
                    user: strategy.user,
                    strategyId: intent.strategyId,
                    amount0: intentAmount,
                    preHookCheck: FHE.asEbool(false),
                    revertData: reason
                });
                emit IntentRejected(intent.intentId, intent.strategyId, strategy.user, reason);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.2 Run Pre-Hooks and get ebool results
            address[] memory hooks = strategy.hooks;
            ebool preHookCheck = _runPreHooks(
                hooks,
                IntentLib.Intent({amount0: intentAmount, intentId: intent.intentId, strategyId: intent.strategyId})
            );

            // 1.3 Compute and Pull in EncryptedERC20 tokens from Strategy User to this contract
            euint64 amountToPull = FHE.select(preHookCheck, intentAmount, FHE.asEuint64(0));
            (bool pullSuccess, bytes memory pullResult) = _pullIn(strategy.user, amountToPull);
            if (!pullSuccess) {
                results[i] = IntentResult({
                    intentId: intent.intentId,
                    user: strategy.user,
                    strategyId: intent.strategyId,
                    amount0: intentAmount,
                    preHookCheck: preHookCheck,
                    revertData: pullResult
                });
                emit IntentRejected(intent.intentId, intent.strategyId, strategy.user, pullResult);
                unchecked {
                    ++i;
                }
                continue;
            }

            // 1.4 Mark Success and Add to Total Token Input
            results[i] = IntentResult({
                intentId: intent.intentId,
                user: strategy.user,
                strategyId: intent.strategyId,
                amount0: intentAmount,
                preHookCheck: preHookCheck,
                revertData: bytes("")
            });

            // 1.5 Add only if preHookCheck is successful
            euint64 toAdd = FHE.select(preHookCheck, intentAmount, FHE.asEuint64(0));
            euint64 runningTotal = FHE.add(totalIn, toAdd);
            totalIn = runningTotal;

            emit IntentAccepted(intent.intentId, intent.strategyId, strategy.user);

            unchecked {
                ++i;
            }
        }

        // Phase 2: Pack pre-hook results for oracle processing
        ebool[] memory checks = new ebool[](batchSize);
        for (uint256 i = 0; i < batchSize;) {
            checks[i] = results[i].preHookCheck;
            unchecked {
                ++i;
            }
        }
        euint64 packedChecks = PackedBool.packEboolArray(checks);

        // Phase 3: Request decryption from FHE oracle
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(totalIn);
        cts[1] = FHE.toBytes32(packedChecks);

        uint256 requestId = FHE.requestDecryption(cts, this.decryptionCallback.selector);

        // Phase 4: Store batch information and prepare for callback
        Batch storage batch = batches[requestId];
        batch.totalResults = batchSize;
        batch.totalIn = totalIn;
        batch.isPending = true;

        // Store results and grant access to amounts
        for (uint256 i = 0; i < batchSize;) {
            batch.results[i] = results[i];
            FHE.allowThis(results[i].amount0);
            unchecked {
                ++i;
            }
        }

        totalBatches++;
        emit BatchRequested(requestId, batchSize);
    }

    /**
     * @notice Callback function called by the FHE decryption oracle
     * @param requestId Unique identifier for the batch request
     * @param totalIn Decrypted total input amount
     * @param packedChecks Decrypted packed boolean array of pre-hook results
     * @param signatures Array of signatures for verification
     * @dev This function is called by the FHE oracle after decryption
     *      It executes the actual swaps and distributes tokens to users
     *
     * Process Flow:
     * 1. Verify oracle signatures
     * 2. Check batch validity and state
     * 3. Execute swap on Uniswap V2
     * 4. Distribute tokens proportionally to users
     * 5. Execute post-swap hooks
     * 6. Mark batch as completed
     *
     * Requirements:
     * - Valid signatures from the FHE oracle
     * - Batch must be pending
     * - Total input amount must be greater than zero
     *
     * @custom:security This function handles the actual token swaps and distributions
     */
    function decryptionCallback(uint256 requestId, uint64 totalIn, uint64 packedChecks, bytes[] memory signatures)
        public
    {
        Batch storage batch = batches[requestId];

        // Verify signatures from the FHE oracle
        FHE.checkSignatures(requestId, signatures);

        // Validate batch state
        if (!batch.isPending) {
            revert BatchAlreadyCompleted();
        }

        if (batch.totalResults == 0) {
            return;
        }

        if (totalIn == 0) {
            return;
        }

        // Unpack pre-hook results
        bool[] memory preHookChecks = PackedBool.unpackBools(packedChecks, batch.totalResults);

        // Withdraw totalIn Encrypted Token0 for swapping
        token0.withdraw(totalIn);

        // Execute swap
        uint256 amountOut = _executeSwap(totalIn);

        // Convert Underlying Token1 Amount to Encrypted Token1
        token1._underlyingToken().approve(address(token1), amountOut);
        token1.deposit(uint64(amountOut));

        uint256 len = batch.totalResults;

        // Distribute Tokens proportionally to Users as per their Intent Amounts
        uint256 successfulIntents = 0;
        for (uint256 i; i < len;) {
            // Check if Intent has passed Checks
            if (!preHookChecks[i]) {
                unchecked {
                    ++i;
                }
                continue;
            }

            euint64 intentAmountIn = batch.results[i].amount0;

            // Calculate Ratio of Intent Amount to Total Token Input
            euint64 encAmountOut = FHE.asEuint64(uint64(amountOut));
            euint64 ratio = FHE.div(intentAmountIn, totalIn);
            euint64 intentAmountOut = FHE.mul(ratio, encAmountOut);

            // Transfer Encrypted Tokens to User
            address user = strategies[batch.results[i].strategyId].user;
            FHE.allowTransient(intentAmountOut, address(token1));
            token1.transfer(user, intentAmountOut);

            // Execute Post-Swap Hooks
            address[] memory hooks = strategies[batch.results[i].strategyId].hooks;
            _executePostHooks(hooks, batch.results[i]);

            successfulIntents++;
            unchecked {
                ++i;
            }
        }

        // Mark batch as completed
        batch.isPending = false;
        emit BatchExecuted(requestId, successfulIntents);
    }

    /**
     * @notice Computes the unique strategy ID based on user and salt
     * @param user Address of the strategy creator
     * @param salt Unique salt for the strategy
     * @return strategyId Deterministically generated strategy identifier
     * @dev The strategy ID is computed as keccak256(user, token0, token1, salt)
     *      This ensures unique identification while allowing users to create multiple strategies
     */
    function computeStrategyId(address user, bytes32 salt) public view returns (bytes32) {
        return keccak256(abi.encodePacked(user, address(token0), address(token1), salt));
    }

    /**
     * @notice Pauses the contract in emergency situations
     * @dev Only callable by owner
     *      When paused, all state-changing functions will revert
     */
    function pause() external onlyOwner {
        paused = true;
        emit PauseStateChanged(true, msg.sender);
    }

    /**
     * @notice Unpauses the contract after emergency situations
     * @dev Only callable by owner
     */
    function unpause() external onlyOwner {
        paused = false;
        emit PauseStateChanged(false, msg.sender);
    }

    // =============================================================
    //                    INTERNAL/PRIVATE FUNCTIONS
    // =============================================================

    /**
     * @notice Executes a swap on Uniswap V2
     * @param totalIn Total amount of token0 to swap
     * @return amountOut Amount of token1 received from the swap
     * @dev This function handles the actual token swap through Uniswap V2
     *      It sets a reasonable deadline and approves the router to spend tokens
     *
     * Requirements:
     * - Total input amount must be greater than zero
     * - Router must have approval to spend token0
     * - Swap deadline must not have expired
     */
    function _executeSwap(uint256 totalIn) internal returns (uint256) {
        if (totalIn == 0) revert ZeroSwapAmount();

        address[] memory path = new address[](2);
        path[0] = address(token0._underlyingToken());
        path[1] = address(token1._underlyingToken());

        // Approve router to spend tokens
        token0._underlyingToken().approve(address(router), totalIn);

        // Execute swap with deadline
        uint256 deadline = block.timestamp + MIN_SWAP_DEADLINE_BUFFER;
        if (block.timestamp >= deadline) revert SwapDeadlineExpired();

        uint256[] memory results = router.swapExactTokensForTokens(
            totalIn,
            0, // Accept any amount of token1
            path,
            address(this),
            deadline
        );

        return results[1];
    }

    /**
     * @notice Validates an array of hook addresses
     * @param hooks Array of hook addresses to validate
     * @dev This function ensures all hooks are valid contracts
     *      It checks for zero addresses and contract existence
     *
     * Requirements:
     * - No hook address can be zero
     * - All hook addresses must be contracts
     */
    function _validateHooks(address[] memory hooks) internal view {
        uint256 hooksLen = hooks.length;

        for (uint256 i; i < hooksLen;) {
            address hook = hooks[i];

            // Check For Zero Address
            if (hook == address(0)) {
                revert ZeroAddress();
            }

            // Check For Contracts
            bool isContract = _isContract(hook);

            if (!isContract) {
                revert NotAContract();
            }

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Executes pre-swap hooks for an intent
     * @param hooks Array of hook addresses to execute
     * @param intent Intent data to pass to hooks
     * @return result Combined boolean result from all hooks
     * @dev This function executes all pre-swap hooks and combines their results
     *      If any hook fails, the entire operation fails
     *      All hooks must return true for the intent to proceed
     *
     * Requirements:
     * - All hooks must implement the ISwapHook interface
     * - Hooks must return valid ebool values
     * - Failed hook calls will emit events but not revert the transaction
     */
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
                emit PreHookFailed(intent.intentId, intent.strategyId, hook, result);
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

    /**
     * @notice Executes post-swap hooks for a completed intent
     * @param hooks Array of hook addresses to execute
     * @param result Intent result data to pass to hooks
     * @dev This function executes all post-swap hooks after successful token distribution
     *      Failed hook calls emit events but don't revert the transaction
     *      This ensures that successful intents are not affected by hook failures
     */
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
                emit PostHookFailed(result.intentId, result.strategyId, hook, res);
            }

            unchecked {
                ++j;
            }
        }
    }

    /**
     * @notice Pulls encrypted tokens from a user to this contract
     * @param from Address to pull tokens from
     * @param amount Amount of tokens to pull
     * @return ok Whether the pull operation was successful
     * @return result Data returned from the pull operation
     * @dev This function calls the transferFrom function on the encrypted token
     *      It grants transient access to the amount for the token contract
     *
     * Requirements:
     * - User must have approved this contract to spend tokens
     * - User must have sufficient token balance
     */
    function _pullIn(address from, euint64 amount) private returns (bool ok, bytes memory result) {
        FHE.allowTransient(amount, address(token0));
        bytes memory data = abi.encodeWithSelector(0xb3c06f50, from, address(this), amount);
        (ok, result) = address(token0).call(data);
    }

    /**
     * @notice Checks if an address is a contract
     * @param account Address to check
     * @return result True if the address is a contract, false otherwise
     * @dev This function uses assembly to check the extcodesize
     *      It's more gas efficient than using the Address library
     */
    function _isContract(address account) internal view returns (bool result) {
        assembly {
            result := gt(extcodesize(account), 0)
        }
    }

    // =============================================================
    //                           MODIFIERS
    // =============================================================

    /**
     * @notice Modifier to check if the contract is not paused
     * @dev Reverts the transaction if the contract is paused
     */
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // =============================================================
    //                           RECEIVE
    // =============================================================

    receive() external payable {}
    fallback() external payable {}
}

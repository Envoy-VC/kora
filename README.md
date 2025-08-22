### Terminology

- WETH: Wrapped ETH
- eWETH: Encrypted WETH, Encrypted Version of WETH which hides user balances, transfer amounts, etc.

## User Flow

```
Initial Conditions:

User WETH Balance: 0.1
User eWETH Balance: 0
```

1. User Deposits 0.1 WETH into Encrypted WETH Contract and get corresponding 0.1 eWETH

```
After Deposit:

User WETH Balance: 0
User eWETH Balance: 0.1
Contract WETH  Balance: 0.1
```

2. User Creates a Strategy using KoraExecutor Contract using the following parameters:
   - User Address
   - Token0 Address
   - Token1 Address
   - SwapHooks

```solidity
strategyId = keccak256(abi.encodePacked(user, token0, token1, timestamp));
```

SwapHooks are hooks that are executed before and after the swap, `preSwap` and `postSwap`, respectively. They are initialized with encrypted parameters which decide whether the swap is allowed or not.

For example, a MaxSpendHook can be used to restrict the amount of tokens that can be swapped, this hooks records encrypted total amount swapped for a strategyId, and compares it with the maximum amount allowed.

```solidity
struct SwapHook {
    address hook;
    bytes data;
}

interface ISwapHook {
    function preSwap(uint256 strategyId, uint256 amount0, uint256 amount1) external;
    function postSwap(uint256 strategyId, uint256 amount0, uint256 amount1) external;
    function initialize(uint256 strategyId, bytes calldata data) external;
}
```

When a strategy is created, the KoraExecutor contract will call `initialize` on the all the swap hooks, passing the strategyId and its respective data.
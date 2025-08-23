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


```
KoraExecutor: 0x8B2421509a49bAC33A3c19133F60B3187Da34514
USDC: 0x14DF2A4c1E70edad89476853a6cEC32Cb21e9300
WETH: 0x36d9620916a78777Ea7c4194cAa80B97c4F1BCfA
eUSDC: 0x724a39308024ECc6f78121113F14a07383522E8F
eWETH: 0xfEd4Ca483dAC8ed7e35294264ec466f0F4785A31
Pair Address: 0x23665C97718BFE1F52408e57bdFEF0d0FE7b314c
BudgetHook: 0xD57622C4fa83ff905c3759cE43F4a0E34f812470
PurchaseAmountHook: 0x8B8d51005d88cCc1C66AfC8B613383DE519457bB
TimeframeHook: 0xd41e281ebc8060E4a996912b18e6A8905c64f462
FrequencyHook: 0xBd31D70F7276891D2E706E6F2502E5AB3e0d2800
```
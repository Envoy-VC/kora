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
KoraExecutor: 0xEc73EC81e4F8c103CFb7173d3aF2eF41486D256b
USDC: 0xFC9393e786cBb8AC48656C02B4cF975D897cf28D
WETH: 0x2104fDa9Ec764D228323814b4EAfAed17c471E26
eUSDC: 0x37d4Bc2055E64b26075e78203913Fe9f6A73A5d4
eWETH: 0x316f85C3BDEf380E5ab5d862dB7aE5C42cC1D0EB
Pair Address: 0xD7e690Fee6aa022711b7c7e2A85bDE56cafe087A
BudgetHook: 0x82c7d0b43E24628eC384bc114Fe94724fb073C5B
PurchaseAmountHook: 0x15853FB2Fb81692b1c77bd507037F78c9c9ceC1B
TimeframeHook: 0x353F6092125a5a59f25BD0baB968fd20e1959D4C
FrequencyHook: 0xce27ADed623Ee8e44caC94B756f21f9A22A76644
```
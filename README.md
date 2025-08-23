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
KoraExecutor: 0x6e2bBe609E602bE493fF8580523Bf1eeBa2c7693
USDC: 0xd86A74554B290683cC7eF08b3abA08e50858a135
WETH: 0xdd54C3FD2A5e21b270E66016BB5bA0451E26EbD6
eUSDC: 0xe7099daf495c9AaD8DbBc609807cCAfCd66c782e
eWETH: 0xEF2E26d484cA21D5e6397FfB1958cdD923F08dcE
Pair Address: 0x4Ba8Ea7ffB1e48593339C15E32A1484F64aAA2dD
BudgetHook: 0x2A8F6aC0b8B5f4cCcB1F418A1531F069bB53ae7e
PurchaseAmountHook: 0xE03dfC67de98519B42Bf91B452b10B92f1b0A761
TimeframeHook: 0x7EE9325031A29074e85F6d1Bd76921d77A94B19b
FrequencyHook: 0xA630cBeF0A9278b72878b6F4ebF880EaecF972fD
```
export const budgetHookAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_executor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_maxBudget",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_spent",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executor",
    outputs: [
      {
        internalType: "contract KoraExecutor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
          {
            internalType: "ebool",
            name: "hasPassedChecks",
            type: "bytes32",
          },
          {
            internalType: "bool",
            name: "hasPulledIn",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "revertData",
            type: "bytes",
          },
        ],
        internalType: "struct IntentResult",
        name: "result",
        type: "tuple",
      },
    ],
    name: "postSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
        ],
        internalType: "struct IntentLib.Intent",
        name: "intent",
        type: "tuple",
      },
    ],
    name: "preSwap",
    outputs: [
      {
        internalType: "ebool",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const frequencyHookAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_executor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_frequency",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_lastExecutedAt",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executor",
    outputs: [
      {
        internalType: "contract KoraExecutor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
          {
            internalType: "ebool",
            name: "hasPassedChecks",
            type: "bytes32",
          },
          {
            internalType: "bool",
            name: "hasPulledIn",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "revertData",
            type: "bytes",
          },
        ],
        internalType: "struct IntentResult",
        name: "result",
        type: "tuple",
      },
    ],
    name: "postSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
        ],
        internalType: "struct IntentLib.Intent",
        name: "",
        type: "tuple",
      },
    ],
    name: "preSwap",
    outputs: [
      {
        internalType: "ebool",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const purchaseAmountHookAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_executor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_maxPurchaseAmount",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executor",
    outputs: [
      {
        internalType: "contract KoraExecutor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
          {
            internalType: "ebool",
            name: "hasPassedChecks",
            type: "bytes32",
          },
          {
            internalType: "bool",
            name: "hasPulledIn",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "revertData",
            type: "bytes",
          },
        ],
        internalType: "struct IntentResult",
        name: "result",
        type: "tuple",
      },
    ],
    name: "postSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
        ],
        internalType: "struct IntentLib.Intent",
        name: "intent",
        type: "tuple",
      },
    ],
    name: "preSwap",
    outputs: [
      {
        internalType: "ebool",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const timeframeHookAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_executor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_validUntil",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executor",
    outputs: [
      {
        internalType: "contract KoraExecutor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
          {
            internalType: "ebool",
            name: "hasPassedChecks",
            type: "bytes32",
          },
          {
            internalType: "bool",
            name: "hasPulledIn",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "revertData",
            type: "bytes",
          },
        ],
        internalType: "struct IntentResult",
        name: "result",
        type: "tuple",
      },
    ],
    name: "postSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "intentId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "amount0",
            type: "bytes32",
          },
        ],
        internalType: "struct IntentLib.Intent",
        name: "",
        type: "tuple",
      },
    ],
    name: "preSwap",
    outputs: [
      {
        internalType: "ebool",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

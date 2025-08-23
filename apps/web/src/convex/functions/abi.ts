export const koraExecutorAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "_token1",
        type: "address",
      },
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "BatchAlreadyCompleted",
    type: "error",
  },
  {
    inputs: [],
    name: "HandlesAlreadySavedForRequestID",
    type: "error",
  },
  {
    inputs: [],
    name: "HookNotAContract",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidKMSSignatures",
    type: "error",
  },
  {
    inputs: [],
    name: "NoHandleFoundForRequestID",
    type: "error",
  },
  {
    inputs: [],
    name: "NonExistentBatch",
    type: "error",
  },
  {
    inputs: [],
    name: "UnsupportedHandleType",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddressHook",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    name: "BatchExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    name: "BatchRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestID",
        type: "uint256",
      },
    ],
    name: "DecryptionFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "intentId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "revertData",
        type: "bytes",
      },
    ],
    name: "HookFailed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "intentId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "IntentAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "intentId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "revertData",
        type: "bytes",
      },
    ],
    name: "IntentRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "timestamp",
            type: "uint64",
          },
          {
            internalType: "address[]",
            name: "hooks",
            type: "address[]",
          },
        ],
        indexed: false,
        internalType: "struct Strategy",
        name: "strategy",
        type: "tuple",
      },
    ],
    name: "StrategyCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "_batches",
    outputs: [
      {
        internalType: "uint256",
        name: "totalResults",
        type: "uint256",
      },
      {
        internalType: "euint64",
        name: "totalIn",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "isPending",
        type: "bool",
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
    name: "_strategies",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint64",
        name: "timestamp",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "computeStrategyId",
    outputs: [
      {
        internalType: "bytes32",
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
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "hook",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct SwapHook[]",
        name: "hooks",
        type: "tuple[]",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "createStrategy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "totalIn",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "preHookCheck1",
        type: "bool",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "decryptionCallback1",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "totalIn",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "preHookCheck1",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck2",
        type: "bool",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "decryptionCallback2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "totalIn",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "preHookCheck1",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck2",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck3",
        type: "bool",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "decryptionCallback3",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "totalIn",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "preHookCheck1",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck2",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck3",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck4",
        type: "bool",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "decryptionCallback4",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "totalIn",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "preHookCheck1",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck2",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck3",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck4",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck5",
        type: "bool",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "decryptionCallback5",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "totalIn",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "preHookCheck1",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck2",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck3",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck4",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck5",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "preHookCheck6",
        type: "bool",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "decryptionCallback6",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
            internalType: "externalEuint64",
            name: "amount0",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "inputProof",
            type: "bytes",
          },
        ],
        internalType: "struct IntentLib.IntentExternal[]",
        name: "intents",
        type: "tuple[]",
      },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IUniswapV2Router02",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [
      {
        internalType: "contract EncryptedERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [
      {
        internalType: "contract EncryptedERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

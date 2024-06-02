export const MIST = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AddressInsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedInnerCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Mist__AddressZero',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Mist__InvalidAmount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'schemeId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'stealthAddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'ephemeralPubKey',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'Announcement',
    type: 'event',
  },
  {
    inputs: [],
    name: 'SCHEME_ID',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'ephemeralPubKey',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'sendERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'ephemeralPubKey',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'sendERC721',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'ephemeralPubKey',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'sendEth',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

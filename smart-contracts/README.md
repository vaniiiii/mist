# 🎮 `Mist` NFT Smart Contracts Repository

## Introduction

🕹️ This project represents privacy-focused protocol that enables stealth addresses for private transactions on Ethereum.

⚙️ Project combines Hardhat & Foundry.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Quick start

**Clone the Repository**

```bash
git git@github.com:vaniiiii/eth-belgrade-2.git

cd eth-belgrade-2/smart-contracts/
```

1. Install Dependencies

```bash
npm install
```

2. Compile and Test Contracts

```bash
forge build
forge test
```

3. Deploy contracts

To deploy the contracts to the Optimism/BNB/Linea networks, first fill out the `.envexample` template and rename it to `.env`. Then, run the deployment script:

```bash
npx hardhat deploy --network NETWORK_NAME
```

## Smart contracts

This project consists of the following smart contracts:

- [KeyRegistry](./contracts/KeyRegistry.sol)
- [Mist](./contracts/Mist.sol)

## KeyRegistry.sol

## Contract Overview

KeyRegistry represents the main register for stealth-meta addresses. The contract ensures the validity and uniqueness of addresses before registering them, enabling secure and organized data.

## Mist.sol

## Contract Overview

Mist is a smart contract for stealth payments on EVM blockchain networks, enabling anonymous transfers of ETH, ERC20, and ERC721 tokens to stealth addresses. It ensures secure and private transactions by utilizing cryptography and metadata announcements to maintain traceability without compromising privacy.

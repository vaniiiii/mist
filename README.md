## Mist Protocol 🌫️

Welcome to Mist! This project expands the concept of stealth addresses for private transactions on Ethereum, inspired by the [Base SAP paper](https://arxiv.org/abs/2306.14272) and incorporating support for ERC721 tokens alongside ETH and ERC20 tokens. Mist also integrates MetaMask Snaps for secure key storage and user notifications, promoting interoperability between different protocols supporting stealth addresses.

📜 Contracts are deployed and verified on the following networks:

- **Sepolia** 🟢

  - Key Registry: [`0xC77484F08f260c571922C112C2AB671093ce1fA9`](https://sepolia.etherscan.io/address/0xC77484F08f260c571922C112C2AB671093ce1fA9)
  - Mist: [`0x6f4ef23960C89145896ee15140128e1b93925668`](https://sepolia.etherscan.io/address/0x6f4ef23960C89145896ee15140128e1b93925668)

- **Optimism Sepolia** 🟠

  - Key Registry: [`0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff`](https://sepolia-optimism.etherscan.io/address/0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff)
  - Mist: [`0xE40c06Eb4409949eeB49a748a0Bed74b21967800`](https://sepolia-optimism.etherscan.io/address/0xE40c06Eb4409949eeB49a748a0Bed74b21967800)

- **BSC Testnet** 🟡

  - Key Registry: [`0x54dF6628Af4fFE86b56885C528115639E3805563`](https://testnet.bscscan.com/address/0x54dF6628Af4fFE86b56885C528115639E3805563)
  - Mist: [`0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff`](https://testnet.bscscan.com/address/0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff)

- **Linea Sepolia** 🟤

  - Key Registry: [`0x54dF6628Af4fFE86b56885C528115639E3805563`](https://sepolia.lineascan.build/address/0x54dF6628Af4fFE86b56885C528115639E3805563)
  - Mist: [`0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff`](https://sepolia.lineascan.build/address/0x54dF6628Af4fFE86b56885C528115639E3805563)

- **Neon EVM** 🟣
  - Key Registry: [`0x54dF6628Af4fFE86b56885C528115639E3805563`](https://devnet.neonscan.org/address/0x54dF6628Af4fFE86b56885C528115639E3805563)
  - Mist: [`0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff`](https://devnet.neonscan.org/address/0xAc158bd90Df4088DeADbDe55eB8ddd92f9dA67Ff)

- **Mantle Sepolia** ⚫
  - Key Registry: [`0x152593E82695A38f95d6F68fd7b350e51f11441e`](https://explorer.sepolia.mantle.xyz/address/0x152593E82695A38f95d6F68fd7b350e51f11441e)
  - Mist: [`0xe1224F7b0eE01e9Ad70C2271b0CC611E933fCD85`](https://explorer.sepolia.mantle.xyz/address/0xe1224F7b0eE01e9Ad70C2271b0CC611E933fCD85)

### What is Mist? 🌟

Mist is a privacy-focused protocol that enables stealth addresses for private transactions on Ethereum. It leverages the foundational ideas from the Base SAP paper and extends them to include ERC721 tokens. Mist enhances security and user experience by using MetaMask Snaps to store spending/viewing keys in encrypted data storage and to send notifications to users. It utilizes elliptic curve cryptography to achieve this level of security and privacy.

### Key Features 🚀

- **Stealth Addresses**: Enable private transactions by generating one-time addresses that can only be spent by the intended recipient.
- **Support for Multiple Tokens**: Mist supports ETH, ERC20, and ERC721 tokens, making it versatile for various use cases.
- **MetaMask Snaps Integration**: Store keys securely within MetaMask and receive notifications for transactions and key updates.
- **Interoperability**: Designed to work seamlessly with different protocols supporting stealth addresses, inspired by the concept from the Base SAP paper.

### Inspiration and Background 📚

Mist is inspired by the innovative concepts introduced in the [Base SAP paper](https://arxiv.org/abs/2306.14272) and builds upon them by implementing standards like [ERC-5564](https://eips.ethereum.org/EIPS/eip-5564) and [ERC-6538](https://eips.ethereum.org/EIPS/eip-6538) to enhance privacy and interoperability. While [Umbra Protocol](https://github.com/ScopeLift/umbra-protocol) has implemented similar stealth address functionality, Mist extends this by supporting ERC721 tokens and integrating MetaMask Snaps for improved user experience.

### How It Works ⚙️

1. **Generating Stealth Addresses**: Mist generates a new, unique address for each transaction, ensuring privacy for both the sender and recipient.
2. **Token Support**: Mist supports transactions with ETH, ERC20, and ERC721 tokens, making it suitable for a wide range of applications.
3. **Key Storage**: Using MetaMask Snaps, Mist stores spending and viewing keys in an encrypted format within MetaMask, providing an additional layer of security.
4. **Notifications**: Users receive notifications via MetaMask Snaps for transaction confirmations and key updates, ensuring they stay informed.

### Getting Started 🚀

To start using Mist, follow these steps:

1. **Install MetaMask**: Ensure you have MetaMask Flask installed in your browser.
2. **Enable Snaps**: Follow the instructions to enable MetaMask Snaps for secure key storage and notifications.
3. **Interact with Mist**: Use the Mist interface to generate stealth addresses, send and receive tokens, and manage your transactions securely.

### Contributing 🤝

We welcome contributions from the community! If you're interested in contributing to Mist, please check out our project and open a pull request.

### License 📄

Mist is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as per the terms of the license.

---

Thank you for using Mist! 🌫️

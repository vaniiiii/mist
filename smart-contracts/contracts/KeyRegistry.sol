// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {console} from "forge-std/Test.sol";

/**
 * @title  KeyRegistry
 * @author vani(@vaniiiii)
 * @notice Key registry is smart contract for storing and registering stealth-meta addresses
 *         Inspired by UMBRA protocol
 */
contract KeyRegistry {
    //////////////////////////////////////////////////////////////////////////
    //                              Constants                               //
    //////////////////////////////////////////////////////////////////////////
    uint256 public constant N =
        115792089237316195423570985008687907852837564279074904382605163141518161494337; // secp256k1 order

    //////////////////////////////////////////////////////////////////////////
    //                          Storage variables                           //
    //////////////////////////////////////////////////////////////////////////
    mapping(address userAddress => mapping(uint256 keyPrefix => uint256 keyValue))
        public stealthMetaAddresses;

    //////////////////////////////////////////////////////////////////////////
    //                                Events                                //
    //////////////////////////////////////////////////////////////////////////
    event StealthMetaAddressRegistered(
        address indexed user,
        uint256 spendingPubKeyPrefix,
        uint256 spendingPubKey,
        uint256 viewingPubKeyPrefix,
        uint256 viewingPubKey
    );

    //////////////////////////////////////////////////////////////////////////
    //                                Errors                                //
    //////////////////////////////////////////////////////////////////////////
    error KeyRegistry__InvalidPrefix();
    error KeyRegistry__InvalidKeyValue();
    error KeyRegistry__StealthMetaAddressAlreadyRegistered();
    error KeyRegistry__StealthMetaAddressNotFound();

    /**
     * @notice Set stealth-meta address for the user
     *
     * @param spendingPubKeyPrefix Prefix of spending public key
     * @param spendingPubKey Spending public key
     * @param viewingPubKeyPrefix Prefix of viewing public key
     * @param viewingPubKey Viewing public key
     */
    function setStealthMetaAddress(
        uint256 spendingPubKeyPrefix,
        uint256 spendingPubKey,
        uint256 viewingPubKeyPrefix,
        uint256 viewingPubKey
    ) external {
        // Validate if stealth-meta address is already registered and in right format
        _checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        emit StealthMetaAddressRegistered(
            msg.sender,
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        // Shift the spending key prefix down by 2, making it the appropriate index of 0 or 1
        spendingPubKeyPrefix -= 2;

        stealthMetaAddresses[msg.sender][spendingPubKeyPrefix] = spendingPubKey;
        stealthMetaAddresses[msg.sender][viewingPubKeyPrefix] = viewingPubKey;
    }

    /**
     * @notice Get stealth-meta address for the user
     *
     * @param userAddress User address
     *
     */
    function getStealthMetaAddress(
        address userAddress
    )
        external
        view
        returns (
            uint256 spendingPubKeyPrefix,
            uint256 spendingPubKey,
            uint256 viewingPubKeyPrefix,
            uint256 viewingPubKey
        )
    {
        if (stealthMetaAddresses[userAddress][0] != 0) {
            spendingPubKeyPrefix = 2;
            spendingPubKey = stealthMetaAddresses[userAddress][0];
        } else {
            spendingPubKeyPrefix = 3;
            spendingPubKey = stealthMetaAddresses[userAddress][1];
        }

        if (stealthMetaAddresses[userAddress][2] != 0) {
            viewingPubKeyPrefix = 2;
            viewingPubKey = stealthMetaAddresses[userAddress][2];
        } else {
            viewingPubKeyPrefix = 3;
            viewingPubKey = stealthMetaAddresses[userAddress][3];
        }

        if (spendingPubKey == 0 || viewingPubKey == 0) {
            revert KeyRegistry__StealthMetaAddressNotFound();
        }

        return (
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    /**
     * @notice Checks if the stealth-meta address is already registered and in the right format
     *
     * @dev Valid values for prefix are 2 and 3, depending on compressed public key format
     *
     * @param spendingPubKeyPrefix Prefix of spending public key
     * @param viewingPubKeyPrefix Prefix of viewing public key
     */
    function _checkStealthMetaAddress(
        uint256 spendingPubKeyPrefix,
        uint256 spendingPubKey,
        uint256 viewingPubKeyPrefix,
        uint256 viewingPubKey
    ) internal view {
        // Check if prefixes are valid
        if (spendingPubKeyPrefix < 2 || spendingPubKeyPrefix > 3) {
            revert KeyRegistry__InvalidPrefix();
        }
        if (viewingPubKeyPrefix < 2 || viewingPubKeyPrefix > 3) {
            revert KeyRegistry__InvalidPrefix();
        }
        // Check if keys are valid
        if (spendingPubKey == 0 || spendingPubKey >= N) {
            revert KeyRegistry__InvalidKeyValue();
        }
        if (viewingPubKey == 0 || viewingPubKey >= N) {
            revert KeyRegistry__InvalidKeyValue();
        }

        uint256 spendingKeyPrefixCheck = 1;
        uint256 viewingKeyPrefixCheck = 3;

        // Verify if the stealth-meta address has been previously registered.
        // It's necessary to inspect both potential prefixes for each key.
        if (
            stealthMetaAddresses[msg.sender][spendingKeyPrefixCheck] != 0 ||
            stealthMetaAddresses[msg.sender][--spendingKeyPrefixCheck] != 0
        ) {
            revert KeyRegistry__StealthMetaAddressAlreadyRegistered();
        }
        if (
            stealthMetaAddresses[msg.sender][viewingKeyPrefixCheck] != 0 ||
            stealthMetaAddresses[msg.sender][--viewingKeyPrefixCheck] != 0
        ) {
            revert KeyRegistry__StealthMetaAddressAlreadyRegistered();
        }
    }
}

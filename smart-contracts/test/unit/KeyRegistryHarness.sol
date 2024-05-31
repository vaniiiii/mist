// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {KeyRegistry} from "../../contracts/KeyRegistry.sol";

/// @title KeyRegistryHarness
/// @notice Contract for internal function testing
contract KeyRegistryHarness is KeyRegistry {
    function exposed_checkStealthMetaAddress(
        uint256 spendingPubKeyPrefix,
        uint256 spendingPubKey,
        uint256 viewingPubKeyPrefix,
        uint256 viewingPubKey
    ) external view {
        _checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }
}

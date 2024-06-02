// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {KeyRegistry} from "../../contracts/KeyRegistry.sol";
import {KeyRegistryHarness} from "./KeyRegistryHarness.sol";
import {SoladyTest} from "@solady/test/utils/SoladyTest.sol";

contract KeyRegister is SoladyTest {
    address immutable i_deployer;

    KeyRegistry keyRegistry;
    KeyRegistryHarness keyRegistryHarness;

    constructor() {
        i_deployer = msg.sender;
    }

    event StealthMetaAddressRegistered(
        address indexed user,
        uint256 spendingPubKeyPrefix,
        uint256 spendingPubKey,
        uint256 viewingPubKeyPrefix,
        uint256 viewingPubKey
    );

    error KeyRegistry__InvalidPrefix();
    error KeyRegistry__InvalidKeyValue();
    error KeyRegistry__StealthMetaAddressAlreadyRegistered();
    error KeyRegistry__StealthMetaAddressNotFound();

    function setUp() public {
        vm.startPrank(i_deployer);
        keyRegistry = new KeyRegistry();
        keyRegistryHarness = new KeyRegistryHarness();
        vm.stopPrank();
    }

    // ==== _checkStealthMetaAddress ==== //
    function test__checkStealthMetaAddressInvalidPrefixSpendingKeyLower()
        external
    {
        uint256 spendingPubKeyPrefix = _bound(_random(), 0, 1);
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        vm.prank(address(keyRegistryHarness));
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test__checkStealthMetaAddressInvalidPrefixViewingKeyLower()
        external
    {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = _bound(_random(), 0, 1);
        uint256 viewingPubKey = _random();

        vm.prank(address(keyRegistryHarness));
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test__checkStealthMetaAddressInvalidPrefixSpendingKeyHigher()
        external
    {
        uint256 spendingPubKeyPrefix = _bound(_random(), 4, type(uint256).max);
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        vm.prank(address(keyRegistryHarness));
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test__checkStealthMetaAddressInvalidPrefixViewingKeyHigher()
        external
    {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = _bound(_random(), 4, type(uint256).max);
        uint256 viewingPubKey = _random();

        vm.prank(address(keyRegistryHarness));
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test__checkStealthMetaAddressSpendingPubKeyZero() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = 0;
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        vm.prank(address(keyRegistryHarness));
        vm.expectRevert(KeyRegistry__InvalidKeyValue.selector);
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test__checkStealthMetaAddressViewingPubKeyZero() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = 0;

        vm.prank(address(keyRegistryHarness));
        vm.expectRevert(KeyRegistry__InvalidKeyValue.selector);
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test__checkStealthMetaAddressStealthMetaAddressAlreadyRegistered()
        external
    {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistryHarness.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        vm.prank(caller);
        vm.expectRevert(
            KeyRegistry__StealthMetaAddressAlreadyRegistered.selector
        );
        keyRegistryHarness.exposed_checkStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    // ==== setStealthMetaAddress ==== //
    function test_setStealthMetaAddress() public {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        spendingPubKeyPrefix -= 2;

        uint256 spendingPubKeySetValue = keyRegistry.stealthMetaAddresses(
            caller,
            spendingPubKeyPrefix
        );
        uint256 viewingPubKeySetValue = keyRegistry.stealthMetaAddresses(
            caller,
            viewingPubKeyPrefix
        );

        assertEq(spendingPubKey, spendingPubKeySetValue);
        assertEq(viewingPubKey, viewingPubKeySetValue);
    }

    function test_setStealthMetaAddressEmitsStealthMetaAddressRegisteredEvent()
        external
    {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.expectEmit(true, true, true, true, address(keyRegistry));
        emit StealthMetaAddressRegistered(
            caller,
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressInvalidPrefixSpendingKey() external {
        uint256 spendingPubKeyPrefix = _bound(_random(), 0, 1);
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressInvalidPrefixViewingKey() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = _bound(_random(), 0, 1);
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressInvalidPrefixSpendingKeyHigher()
        external
    {
        uint256 spendingPubKeyPrefix = _bound(_random(), 4, type(uint256).max);
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressInvalidPrefixViewingKeyHigher()
        external
    {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = _bound(_random(), 4, type(uint256).max);
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__InvalidPrefix.selector);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressSpendingPubKeyZero() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = 0;
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__InvalidKeyValue.selector);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressViewingPubKeyZero() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = 0;

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__InvalidKeyValue.selector);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    function test_setStealthMetaAddressStealthMetaAddressAlreadyRegistered()
        external
    {
        uint256 spendingPubKeyPrefix = 3;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 2;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        vm.prank(caller);
        vm.expectRevert(
            KeyRegistry__StealthMetaAddressAlreadyRegistered.selector
        );
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );
    }

    // ==== getStealthMetaAddress ==== //
    function test_getStealthMetaAddressPrefix2And3() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        (
            uint256 spendingPubKeyPrefixValue,
            uint256 spendingPubKeyValue,
            uint256 viewingPubKeyPrefixValue,
            uint256 viewingPubKeyValue
        ) = keyRegistry.getStealthMetaAddress(caller);

        assertEq(spendingPubKeyPrefix, spendingPubKeyPrefixValue);
        assertEq(spendingPubKey, spendingPubKeyValue);
        assertEq(viewingPubKeyPrefix, viewingPubKeyPrefixValue);
        assertEq(viewingPubKey, viewingPubKeyValue);
    }

    function test_getStealthMetaAddressPrefix2And2() external {
        uint256 spendingPubKeyPrefix = 2;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 2;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        (
            uint256 spendingPubKeyPrefixValue,
            uint256 spendingPubKeyValue,
            uint256 viewingPubKeyPrefixValue,
            uint256 viewingPubKeyValue
        ) = keyRegistry.getStealthMetaAddress(caller);

        assertEq(spendingPubKeyPrefix, spendingPubKeyPrefixValue);
        assertEq(spendingPubKey, spendingPubKeyValue);
        assertEq(viewingPubKeyPrefix, viewingPubKeyPrefixValue);
        assertEq(viewingPubKey, viewingPubKeyValue);
    }

    function test_getStealthMetaAddressPrefix3And2() external {
        uint256 spendingPubKeyPrefix = 3;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 2;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        (
            uint256 spendingPubKeyPrefixValue,
            uint256 spendingPubKeyValue,
            uint256 viewingPubKeyPrefixValue,
            uint256 viewingPubKeyValue
        ) = keyRegistry.getStealthMetaAddress(caller);

        assertEq(spendingPubKeyPrefix, spendingPubKeyPrefixValue);
        assertEq(spendingPubKey, spendingPubKeyValue);
        assertEq(viewingPubKeyPrefix, viewingPubKeyPrefixValue);
        assertEq(viewingPubKey, viewingPubKeyValue);
    }

    function test_getStealthMetaAddressPrefix3And3() external {
        uint256 spendingPubKeyPrefix = 3;
        uint256 spendingPubKey = _random();
        uint256 viewingPubKeyPrefix = 3;
        uint256 viewingPubKey = _random();

        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        keyRegistry.setStealthMetaAddress(
            spendingPubKeyPrefix,
            spendingPubKey,
            viewingPubKeyPrefix,
            viewingPubKey
        );

        (
            uint256 spendingPubKeyPrefixValue,
            uint256 spendingPubKeyValue,
            uint256 viewingPubKeyPrefixValue,
            uint256 viewingPubKeyValue
        ) = keyRegistry.getStealthMetaAddress(caller);

        assertEq(spendingPubKeyPrefix, spendingPubKeyPrefixValue);
        assertEq(spendingPubKey, spendingPubKeyValue);
        assertEq(viewingPubKeyPrefix, viewingPubKeyPrefixValue);
        assertEq(viewingPubKey, viewingPubKeyValue);
    }

    function test_getStealthMetaAddressStealthMetaAddressNotFound() external {
        address caller = _randomNonZeroAddress();

        vm.prank(caller);
        vm.expectRevert(KeyRegistry__StealthMetaAddressNotFound.selector);
        keyRegistry.getStealthMetaAddress(caller);
    }
}

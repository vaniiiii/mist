// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {console} from "forge-std/console.sol";
import {Myst} from "../../contracts/Myst.sol";
import {SoladyTest} from "@solady/test/utils/SoladyTest.sol";
import {MockERC20} from "../../contracts/mocks/MockERC20.sol";
import {MockERC721} from "../../contracts/mocks/MockERC721.sol";

contract MystTest is SoladyTest {
    uint256 public constant SCHEME_ID = 1; // For secp256k1 elliptic curve is 1
    address immutable i_deployer;

    Myst myst;
    MockERC20 mockERC20;
    MockERC721 mockERC721;

    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );

    error Myst__InvalidAmount();
    error Myst__AddressZero();

    constructor() {
        i_deployer = msg.sender;
    }

    function setUp() public {
        vm.startPrank(i_deployer);
        myst = new Myst();
        mockERC20 = new MockERC20();
        mockERC721 = new MockERC721();
        vm.stopPrank();
    }
    function test_sendETH() external {
        uint256 amount = _bound(_random(), 0.1 ether, 10 ether);
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        uint256 balanceBefore = address(receiver).balance;

        vm.deal(sender, amount);

        vm.prank(sender);
        myst.sendEth{value: amount}(receiver, ephemeralPubKey, metadata);

        assertEq(address(receiver).balance, balanceBefore + amount);
    }
    function test_sendETHEmitsAnnouncement() external {
        uint256 amount = _bound(_random(), 0.1 ether, 10 ether);
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.deal(sender, amount);

        vm.expectEmit(true, true, true, true, address(myst));
        emit Announcement(
            SCHEME_ID,
            receiver,
            sender,
            ephemeralPubKey,
            metadata
        );

        vm.prank(sender);
        myst.sendEth{value: amount}(receiver, ephemeralPubKey, metadata);
    }
    function test_sendETHInvalidAmount() external {
        uint256 amount = 0;
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.deal(sender, amount);

        vm.prank(sender);
        vm.expectRevert(Myst__InvalidAmount.selector);
        myst.sendEth{value: amount}(receiver, ephemeralPubKey, metadata);
    }
    function test_sendETHAddressZero() external {
        uint256 amount = _bound(_random(), 0.1 ether, 10 ether);
        address sender = _randomNonZeroAddress();
        address receiver = address(0);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.deal(sender, amount);

        vm.prank(sender);
        vm.expectRevert(Myst__AddressZero.selector);
        myst.sendEth{value: amount}(receiver, ephemeralPubKey, metadata);
    }
    function test_sendERC20() external {
        uint256 amount = _bound(_random(), 0.1 ether, 100 ether);
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        address tokenAddress = address(mockERC20);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        uint256 balanceBefore = mockERC20.balanceOf(receiver);

        vm.startPrank(sender);
        mockERC20.mint(sender, amount);
        mockERC20.approve(address(myst), amount);
        myst.sendERC20(
            receiver,
            tokenAddress,
            amount,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();

        assertEq(mockERC20.balanceOf(receiver), balanceBefore + amount);
    }
    function test_sendERC20EmitsAnnouncement() external {
        uint256 amount = _bound(_random(), 0.1 ether, 100 ether);
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        address tokenAddress = address(mockERC20);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.startPrank(sender);
        mockERC20.mint(sender, amount);
        mockERC20.approve(address(myst), amount);

        vm.expectEmit(true, true, true, true, address(myst));
        emit Announcement(
            SCHEME_ID,
            receiver,
            sender,
            ephemeralPubKey,
            metadata
        );

        myst.sendERC20(
            receiver,
            tokenAddress,
            amount,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();
    }
    function test_sendERC20InvalidAmount() external {
        uint256 amount = 0;
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        address tokenAddress = address(mockERC20);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.startPrank(sender);
        mockERC20.mint(sender, amount);
        mockERC20.approve(address(myst), amount);

        vm.expectRevert(Myst__InvalidAmount.selector);
        myst.sendERC20(
            receiver,
            tokenAddress,
            amount,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();
    }
    function test_sendERC20AddressZero() external {
        uint256 amount = _bound(_random(), 0.1 ether, 100 ether);
        address sender = _randomNonZeroAddress();
        address receiver = address(0);
        address tokenAddress = address(mockERC20);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.startPrank(sender);
        mockERC20.mint(sender, amount);
        mockERC20.approve(address(myst), amount);

        vm.expectRevert(Myst__AddressZero.selector);
        myst.sendERC20(
            receiver,
            tokenAddress,
            amount,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();
    }
    function test_sendERC721() external {
        uint256 tokenId = _random();
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        address tokenAddress = address(mockERC721);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.startPrank(sender);
        mockERC721.mint(sender, tokenId);
        mockERC721.approve(address(myst), tokenId);
        myst.sendERC721(
            receiver,
            tokenAddress,
            tokenId,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();

        assertEq(mockERC721.ownerOf(tokenId), receiver);
    }

    function test_sendERC721EmitsAnnouncement() external {
        uint256 tokenId = _random();
        address sender = _randomNonZeroAddress();
        address receiver = _randomNonZeroAddress();
        address tokenAddress = address(mockERC721);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.startPrank(sender);
        mockERC721.mint(sender, tokenId);
        mockERC721.approve(address(myst), tokenId);

        vm.expectEmit(true, true, true, true, address(myst));
        emit Announcement(
            SCHEME_ID,
            receiver,
            sender,
            ephemeralPubKey,
            metadata
        );

        myst.sendERC721(
            receiver,
            tokenAddress,
            tokenId,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();
    }

    function test_sendERC721AddressZero() external {
        uint256 tokenId = _random();
        address sender = _randomNonZeroAddress();
        address receiver = address(0);
        address tokenAddress = address(mockERC721);
        bytes memory ephemeralPubKey = abi.encodePacked(_random());
        bytes memory metadata = abi.encodePacked(_random()); // just mocking

        vm.startPrank(sender);
        mockERC721.mint(sender, tokenId);
        mockERC721.approve(address(myst), tokenId);

        vm.expectRevert(Myst__AddressZero.selector);
        myst.sendERC721(
            receiver,
            tokenAddress,
            tokenId,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title  Mist
 * @author vani(@vaniiiii)
 * @notice Mist is smart contract for stealth payments on EVM blockchain networks.
 *         Inspired by UMBRA protocol
 */
contract Mist {
    //////////////////////////////////////////////////////////////////////////
    //                             Custom types                             //
    //////////////////////////////////////////////////////////////////////////
    using SafeERC20 for IERC20;

    //////////////////////////////////////////////////////////////////////////
    //                             Constants                                //
    //////////////////////////////////////////////////////////////////////////
    uint256 public constant SCHEME_ID = 1; // For secp256k1 elliptic curve is 1

    //////////////////////////////////////////////////////////////////////////
    //                                Events                                //
    //////////////////////////////////////////////////////////////////////////
    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );

    //////////////////////////////////////////////////////////////////////////
    //                                Error                                 //
    //////////////////////////////////////////////////////////////////////////
    error Mist__InvalidAmount();
    error Mist__AddressZero();

    //////////////////////////////////////////////////////////////////////////
    //                            External functions                        //
    //////////////////////////////////////////////////////////////////////////
    /**
     * @notice Send ETH to the receiver stealth address and announce the ETH transfer
     *
     * @param receiver Stealth address of the receiver
     * @param ephemeralPubKey Ephemeral public key of the sender
     * @param metadata Metadata for the announcement
     */
    function sendEth(
        address receiver,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external payable {
        if (msg.value == 0) {
            revert Mist__InvalidAmount();
        }
        if (receiver == address(0)) {
            revert Mist__AddressZero();
        }

        (bool success, ) = payable(receiver).call{value: address(this).balance}(
            ""
        );
        require(success);

        emit Announcement(
            SCHEME_ID,
            receiver,
            msg.sender,
            ephemeralPubKey,
            metadata
        );
    }

    /**
     * @notice Send ERC20 token to the receiver stealth address and announce the token transfer
     *
     * @param receiver Stealth address of the receiver
     * @param tokenAddress ERC20 token address
     * @param amount Amount of tokens to send
     */
    function sendERC20(
        address receiver,
        address tokenAddress,
        uint256 amount,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external {
        if (amount == 0) {
            revert Mist__InvalidAmount();
        }
        if (receiver == address(0) || tokenAddress == address(0)) {
            revert Mist__AddressZero();
        }

        IERC20(tokenAddress).safeTransferFrom(msg.sender, receiver, amount);
        emit Announcement(
            SCHEME_ID,
            receiver,
            msg.sender,
            ephemeralPubKey,
            metadata
        );
    }

    /**
     * @notice Send ERC721 token to the receiver stealth address and announce the token transfer
     *
     * @param receiver Stealth address of the receiver
     * @param tokenAddress ERC721 token address
     * @param tokenId Token ID to send
     */
    function sendERC721(
        address receiver,
        address tokenAddress,
        uint256 tokenId,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external {
        if (receiver == address(0) || tokenAddress == address(0)) {
            revert Mist__AddressZero();
        }

        IERC721(tokenAddress).transferFrom(msg.sender, receiver, tokenId);
        emit Announcement(
            SCHEME_ID,
            receiver,
            msg.sender,
            ephemeralPubKey,
            metadata
        );
    }
}

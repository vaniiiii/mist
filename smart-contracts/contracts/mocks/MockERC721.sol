//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    constructor() ERC721("Test", "TEST") {}

    function mint(address receiver, uint256 tokenId) external {
        _mint(receiver, tokenId);
    }
}

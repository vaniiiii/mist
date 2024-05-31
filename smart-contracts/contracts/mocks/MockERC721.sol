//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    uint256 index;

    constructor() ERC721("Test", "TEST") {}

    function mint(address receiver) external {
        uint256 tokenId = index;

        _mint(receiver, tokenId);
        index = tokenId + 1;
    }
}

//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint256 index;

    constructor() ERC20("Test", "TEST") {}

    function mint(address receiver) external {
        uint256 tokenId = index;

        _mint(receiver, tokenId);
        index = tokenId + 1;
    }
}

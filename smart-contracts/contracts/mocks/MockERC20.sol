//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Test", "TEST") {}

    function mint(address receiver, uint256 amount) external {
        _mint(receiver, amount);
    }
}

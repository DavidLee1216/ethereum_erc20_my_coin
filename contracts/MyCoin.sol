// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "hardhat/console.sol";

contract MyCoin is ERC20, Ownable, ERC20Burnable {
    event tokensBurned(address indexed owner, uint256 amount, string message);
    event tokensMinted(address indexed owner, uint256 amount, string message);
    event additionalTokensMinted(
        address indexed owner,
        uint256 amount,
        string message
    );

    constructor() ERC20("MyCoin", "MYC") {
        _mint(msg.sender, 1000 * 10**decimals());
        emit tokensMinted(
            msg.sender,
            1000 * 10**decimals(),
            "Initial supply of tokens minted."
        );
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit additionalTokensMinted(
            msg.sender,
            amount,
            "Additional tokens minted."
        );
    }

    function burnFrom(address account, uint256 amount)
        public
        override
        onlyOwner
    {
        _burn(account, amount);
        emit tokensBurned(account, amount, "Tokens burned.");
    }
}

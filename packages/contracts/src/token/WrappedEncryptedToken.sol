// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, ebool, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {EncryptedERC20} from "./EncryptedERC20.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WrappedEncryptedToken is SepoliaConfig {
    using FHE for *;

    IERC20 public immutable _underlyingToken;
    EncryptedERC20 public immutable _underlyingEncryptedToken;

    // Errors
    error InsufficientBalance();

    // Events
    event Deposit(address indexed sender, uint64 amount);
    event Withdraw(address indexed sender, uint64 amount);

    constructor(string memory name_, string memory symbol_, address underlyingToken_) {
        _underlyingToken = IERC20(underlyingToken_);
        _underlyingEncryptedToken = new EncryptedERC20(name_, symbol_, address(this));
    }

    function wrapTokens(uint64 amount, address receiver) internal {
        _underlyingEncryptedToken.mint(receiver, amount);
    }

    function deposit(uint64 amount) public payable {
        uint256 balance = _underlyingToken.balanceOf(msg.sender);
        if (balance < amount) revert InsufficientBalance();
        _underlyingToken.transferFrom(msg.sender, address(this), amount);
        wrapTokens(amount, msg.sender);
    }

    function withdraw(uint64 amount) public {
        euint64 encAmount = FHE.asEuint64(amount);
        encAmount.allow(address(_underlyingEncryptedToken));
        // Burn the tokens
        _underlyingEncryptedToken.transferFrom(msg.sender, address(0), encAmount);
        // Transfer Underlying Token to Sender
        _underlyingToken.transfer(msg.sender, amount);
    }
}

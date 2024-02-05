// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint8 public language;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ReceiptPrinted(
        string userName,
        uint256 balance,
        string fatherName,
        string nomineeName1,
        string nomineeName2,
        string transactionType,
        uint256 amount
    );
    event LanguageChanged(uint8 newLanguage);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        language = 0; // English by default
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function printReceipt() public {
        require(msg.sender == owner, "You are not the owner of this account");

        string memory userName = "Harinath ";
        string memory fatherName = "Harinath ";
        string memory nomineeName1 = "Harinath";
        string memory nomineeName2 = "Harinath ";
        string memory transactionType = "Deposit";
        uint256 amount = 1;

        emit ReceiptPrinted(userName, balance, fatherName, nomineeName1, nomineeName2, transactionType, amount);
    }

    function changeLanguage(uint8 _language) public {
        require(_language <= 2, "Invalid language selection"); // Ensure language is within bounds
        require(msg.sender == owner, "You are not the owner of this account");

        language = _language;

        emit LanguageChanged(language);
    }
}

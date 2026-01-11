// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MVPDealRoom {
    address public owner;
    struct Deal { uint id; address proposer; string meta; }
    Deal[] public deals;

    constructor() {
        owner = msg.sender;
    }

    function propose(string memory meta) public returns (uint) {
        deals.push(Deal({ id: deals.length, proposer: msg.sender, meta: meta }));
        return deals.length - 1;
    }
}

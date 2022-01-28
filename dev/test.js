const Blockchain = require('./blockchain.js');

const bitcoin = new Blockchain();

let bc1 = {
    "chain": [
    {
    "index": 1,
    "timestamp": 1643191470707,
    "transactions": [],
    "nonce": 0,
    "hash": "000000000000000000000000",
    "previousBlockHash": ""
    },
    {
    "index": 2,
    "timestamp": 1643191494080,
    "transactions": [],
    "nonce": 100416,
    "hash": "0000a644df4ac8e51db6921e7c0eba4c6d7206da462952b83d8601d93354d45d",
    "previousBlockHash": "000000000000000000000000"
    },
    {
    "index": 3,
    "timestamp": 1643191730384,
    "transactions": [
    {
    "amount": 10,
    "sender": "00",
    "receiver": "5a8150507e8f11ec9a5fa3118e826fb7",
    "transactionId": "688c48d07e8f11ec9a5fa3118e826fb7"
    },
    {
    "amount": 10,
    "sender": "ADGSDFGHJLŞLJMHASFGRHSDT",
    "receiver": "AEGSJHFDYLGLŞLJDHGSDFGHDKJRTYK",
    "transactionId": "f14162a07e8f11ec9a5fa3118e826fb7"
    }
    ],
    "nonce": 127301,
    "hash": "0000a0395babaf468651bab26041f46d39e6311d6fb2a8c4ce4ca5366255130c",
    "previousBlockHash": "0000a644df4ac8e51db6921e7c0eba4c6d7206da462952b83d8601d93354d45d"
    }
    ],
    "newTransactions": [
    {
    "amount": 10,
    "sender": "00",
    "receiver": "5a8150507e8f11ec9a5fa3118e826fb7",
    "transactionId": "f5614b207e8f11ec9a5fa3118e826fb7"
    },
    {
    "amount": 15,
    "sender": "ADGSDFGHJLŞLJMHASFGRHSDT",
    "receiver": "AEGSJHFDYLGLŞLJDHGSDFGHDKJRTYK",
    "transactionId": "fb426ba07e8f11ec9a5fa3118e826fb7"
    }
    ],
    "currentUrl": "http://localhost:3000",
    "allUrls": []
};

console.log("valid:",bitcoin.chainIsValid(bc1.chain));

const sha256 = require("sha256");
const thisNodeUrl = process.argv[3]; 
const uuid = require("uuid");

function Blockchain(){
    this.chain = [];
    this.newTransactions = [];

    this.currentUrl = thisNodeUrl;
    this.allUrls = [];

    this.newBlock(0, "", "000000000000000000000000")
}

Blockchain.prototype.newBlock = function(nonce, lastBlockHash, hash){
    const newBlock ={
        index: this.chain.length +1,
        timestamp: Date.now(),
        transactions: this.newTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: lastBlockHash
    }
    this.newTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function(amount, sender, receiver){
    const newTransaction = {
        amount: amount,
        sender:sender,
        receiver:receiver,
        transactionId: uuid.v1().split("-").join("")
    };

    return newTransaction;
}

Blockchain.prototype.addNewTransaction = function(transactionObj){
    this.newTransactions.push(transactionObj);
    return this.getLastBlock().index + 1;
}

Blockchain.prototype.hashBlock = function(previousHash, currentBlock, nonce){
    const string = previousHash + nonce.toString() + JSON.stringify(currentBlock);
    const hash = sha256(string);
    return hash;
}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    let hash;
    for(let nonce =0; true; nonce++){
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        if(hash.substring(0,4) == "0000"){
            return nonce;
        }
    }
    
}

Blockchain.prototype.chainIsValid = function(checkChain){
    for(let i = 1;i < checkChain.length;i++){
        const hash = this.hashBlock(checkChain[i].previousBlockHash,
                                    {transactions: checkChain[i].transactions,
                                    index: checkChain[i].index}, checkChain[i].nonce);
        if(hash.substring(0,4) !== "0000") return false;
        if(checkChain[i].previousBlockHash !== checkChain[i-1].hash) return false;
    }

    if(
        (checkChain[0].index !== 1)||
        (checkChain[0].previousBlockHash !== "")||
        (checkChain[0].hash !== "000000000000000000000000")||
        (checkChain[0].transactions.length !== 0)||
        (checkChain[0].nonce !== 0)
    )return false;

    return true;
}

Blockchain.prototype.getBlock = function(hash){
    for(block of this.chain){
        if(block.hash === hash) return block;
    }
    return null;
} 

Blockchain.prototype.getTransaction = function(transactionId){
    for(block of this.chain){
        for(transaction of block.transactions){
            if(transaction.transactionId === transactionId){
                return{
                    transaction: transaction,
                    block: block
                };
            }
        }
    }
    return{
        transaction: null,
        block:null
    }
}

Blockchain.prototype.getAdressData = function(address){
    let addresstransactions = [];
    for(block of this.chain){
        console.log(block.index);
        block.transactions.forEach(transaction =>{
            if(address === transaction.sender || address === transaction.receiver) addresstransactions.push(transaction);
        })
    }

    let balance = 0;
    for(transaction of addresstransactions){
        if(address === transaction.sender) balance -= transaction.amount;
        if(address === transaction.receiver) balance += transaction.amount;
    }

    return {
        addresstransactions: addresstransactions,
        balance: balance
    }
}

module.exports = Blockchain;
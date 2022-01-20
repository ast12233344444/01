const sha256 = require("sha256");

function Blockchain(){
    this.chain = [];
    this.newTransactions = [];
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

Blockchain.prototype.addNewTransaction = function(amount, sender, receiver){
    const newTransaction = {
        amount: amount,
        sender:sender,
        receiver:receiver
    };

    this.newTransactions.push(newTransaction);

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
        console.log(hash);
        if(hash.substring(0,4) == "0000"){
            return nonce;
        }
    }
    
}

module.exports = Blockchain;
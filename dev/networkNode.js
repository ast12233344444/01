const express = require("express");
var app = express();
const uuid = require("uuid");
const nodeaddress = uuid.v1().split("-").join("");
const port = process.argv[2];
const rp = require("request-promise");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const Blockchain = require("./blockchain");
const { post } = require("request-promise");
const req = require("express/lib/request");
const newcoin = new Blockchain();

app.get("/blockchain", function(req, res){
    res.send(newcoin);
});

app.post("/transaction", function(req, res){
    const index = newcoin.addNewTransaction(req.body.transactionObj);
    res.json({note:"the transaction will be added to "+ index+  ". block"});
});

app.post("/transaction/broadcast", function(req, res){
    const newTransaction = newcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.receiver);
    newcoin.addNewTransaction(newTransaction);

    const requestReturns = [];
    for(url of newcoin.allUrls){
        const reqOpt = {
            uri: url + "/transaction",
            method:"POST",
            body:{transactionObj: newTransaction},
            json: true
        };
        requestReturns.push(rp(reqOpt));
    }

    Promise.all(requestReturns).then(function(data){
        res.json({ note: "transaction broadcasted succesfully"});
    });
});

app.get("/mine", function(req, res){
    const previousBlockHash = newcoin.getLastBlock().hash;
    console.log("previous hash :" + previousBlockHash);
    const currentBlockData = {
        transactions:  newcoin.newTransactions,
        index: newcoin.chain.length + 1
    }
    const nonce = newcoin.proofOfWork(previousBlockHash, currentBlockData);
    const hash = newcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = newcoin.newBlock(nonce, previousBlockHash, hash);
    const promises = [];
    for(url of newcoin.allUrls){
        const reqOpt = {
            uri : url + "/receive-new-block",
            method: "POST",
            body: { newBlock: newBlock},
            json: true
        }

        promises.push(rp(reqOpt));
    }

    Promise.all(promises).then(function(data){
        const reqOpt ={
            uri: newcoin.currentUrl + "/transaction/broadcast",
            method: "POST",
            body:{
                amount:10,
                sender:"00",
                receiver: nodeaddress
            },
            json:true
        };
        rp(reqOpt);

    }).then(function(data){
        res.json({
            note: "new block mined",
            details: newBlock
        })
    })
});

app.post("/receive-new-block", function(req, res){
    if(req.body.newBlock.previousBlockHash == newcoin.getLastBlock().hash){
        console.log("prev hash accepted");
        if(req.body.newBlock.index == newcoin.chain.length + 1){
            newcoin.chain.push(req.body.newBlock);
            newcoin.newTransactions = [];
            res.json({
                note: "new block accepted",
                newBlock: req.body.newBlock
            });
            return;
        }
    }
    console.log("new block rejected")
    res.json({
        note: "new block rejected",
        newBlock: req.body.newBlock
    })
});

app.post("/register-and-broadcast", function(req, res){
    newNodeUrl = req.body.newNodeUrl;
    if(newcoin.allUrls.indexOf(newNodeUrl) == -1) newcoin.allUrls.push(newNodeUrl);
    const allpromises = [];

    for(nodeUrl of newcoin.allUrls){
        const requestOptions = {
            uri : nodeUrl + "/register-node",
            method:"POST",
            body:{
                newNodeUrl: newNodeUrl
            },
            json: true
        }
        
        allpromises.push(rp(requestOptions));
    }
    Promise.all(allpromises).then(function(data){
        const bulkRegisterOptions = {
            uri: newNodeUrl + "/register-nodes-bulk",
            method: "POST",
            body:{
                allNetworkNodes: [...newcoin.allUrls , newcoin.currentUrl]
            },
            json: true
        }

        return rp(bulkRegisterOptions);
    }).then(function(){
        res.json({
            note: "new node added succesfully"
        });
    });


});

app.post("/register-node", function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    if(newcoin.allUrls.indexOf(newNodeUrl) == -1){
        if(newcoin.currentUrl !== newNodeUrl){
            newcoin.allUrls.push(newNodeUrl);
        }
    }
    res.json({note: "new node registered succesfully"});
});

app.post("/register-nodes-bulk", function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    for(nodeUrl of allNetworkNodes){
        if(nodeUrl !== newcoin.currentUrl){
            if(newcoin.allUrls.indexOf(nodeUrl) == -1){
                newcoin.allUrls.push(nodeUrl);
            }
        }
    }
    res.json({
        note: "bulk nodes registered successfully"
    });
});

app.get("/consensus", function(req, res){
    const reqprom = [];
    for(url of newcoin.allUrls){
        const reqOpt = {
            uri: url + "/blockchain",
            metohd: "GET",
            json: true
        };
        reqprom.push(rp(reqOpt));
    }

    Promise.all(reqprom).then(function(blockchains){
        let longestChain = newcoin.chain;
        let newNewTransactions = null;

        for(blockchain of blockchains){
            if(blockchain.chain.length > longestChain.length){
                longestChain = blockchain.chain;
                newNewTransactions = blockchain.newTransactions;
            }
        }
        if (!newNewTransactions || (newNewTransactions && !newcoin.chainIsValid(longestChain))){
            res.json({
                note: "blockchain not replaced",
                chain: longestChain
            })
        }else{
            newcoin.chain = longestChain;
            newcoin.newTransactions = newNewTransactions;
            res.json({
                note: "blockchain has replaced"
            });
        }
    });
});

app.get("/blockchain/:blockHash" , function(req, res){
    const result = newcoin.getBlock(req.params.blockHash);
    res.json({
        block: result
    });
})

app.get("/transaction/:transaction", function(req, res){
    const transactionId = req.params.transaction;
    const result = newcoin.getTransaction(transactionId);
    res.send(result);
})

app.get("/address/:address", function(req, res){
    const address = req.params.address;
    const addressData = newcoin.getAdressData(address);
    res.json({
        addressData: addressData
    });
}); 


app.listen(port, function(){
    console.log("listening at "+ port+ "...");
});

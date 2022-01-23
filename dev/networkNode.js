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
const aminacoin = new Blockchain();

app.get("/blockchain", function(req, res){
    res.send(aminacoin);
});

app.post("/transaction", function(req, res){
    const index = aminacoin.addNewTransaction(req.body.transactionObj);
    res.json({note:"the transaction will be added to "+ index+  ". block"});
});

app.post("/transaction/broadcast", function(req, res){
    const newTransaction = aminacoin.createNewTransaction(req.body.amount, req.body.sender, req.body.receiver);
    aminacoin.addNewTransaction(newTransaction);

    const requestReturns = [];
    for(url of aminacoin.allUrls){
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
    const previousBlockHash = aminacoin.getLastBlock().hash;
    console.log("previous hash :" + previousBlockHash);
    const currentBlockData = {
        transactions:  aminacoin.newTransactions,
        index: aminacoin.chain.length + 1
    }
    const nonce = aminacoin.proofOfWork(previousBlockHash, currentBlockData);
    const hash = aminacoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    console.log("current hash: " + hash);

    aminacoin.addNewTransaction(10, "00", nodeaddress);
    const newBlock = aminacoin.newBlock(nonce, previousBlockHash, hash);

    res.json({
        note: "new block mined",
        details: newBlock
    })

});

app.post("/register-and-broadcast", function(req, res){
    newNodeUrl = req.body.newNodeUrl;
    if(aminacoin.allUrls.indexOf(newNodeUrl) == -1) aminacoin.allUrls.push(newNodeUrl);
    const allpromises = [];

    for(nodeUrl of aminacoin.allUrls){
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
        //....
        const bulkRegisterOptions = {
            uri: newNodeUrl + "/register-nodes-bulk",
            method: "POST",
            body:{
                allNetworkNodes: [...aminacoin.allUrls , aminacoin.currentUrl]
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
    if(aminacoin.allUrls.indexOf(newNodeUrl) == -1){
        if(aminacoin.currentUrl !== newNodeUrl){
            aminacoin.allUrls.push(newNodeUrl);
        }
    }
    res.json({note: "new node registered succesfully"});
});

app.post("/register-nodes-bulk", function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    for(nodeUrl of allNetworkNodes){
        if(nodeUrl !== aminacoin.currentUrl){
            if(aminacoin.allUrls.indexOf(nodeUrl) == -1){
                aminacoin.allUrls.push(nodeUrl);
            }
        }
    }
    res.json({
        note: "bulk nodes registered successfully"
    });
});


app.listen(port, function(){
    console.log("listening at "+ port+ "...");
});

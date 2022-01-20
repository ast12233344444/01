const Blockchain = require('./blockchain.js');

const bitcoin = new Blockchain();

const previousBlockHash = "GWSRHHJD08T7DHD087HDGH";

const currentBlockData = [
    {
        amount: 5,
        sender: "SRHRJREDTYJIEDRSW",
        receiver: "HJDGJGJDTHYKFHJDG"
    },
    {
        amount: 10,
        sender: "SRHRJHDTKMJDHRWRSW",
        receiver: "HJDGJGTJEDTGHSRHJDG"
    },
    {
        amount: 5,
        sender: "SRHRDSFHFHSGSEDGSHW",
        receiver: "HJDGSBSFHSRHDFMNGJNDG"
    }
]

const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

const currentHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

console.log(nonce);

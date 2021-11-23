const AWSHttpProvider = require("@aws/web3-http-provider");
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require("web3");

const HTTPS = "https://";
const AMB   = ".ethereum.managedblockchain.ap-southeast-1.amazonaws.com";
const HOST  = HTTPS + process.env.AWS_ETH_NODE.toLowerCase() + AMB;
const web3 = new Web3(new AWSHttpProvider(HOST));

exports.handler =  async function(event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2))
    
    if (!event || !event.action) {
        return {
            statusCode: 400,
            body: "Missing action"
        }
    }
    
    switch (event.action) {
        case 'getBalance':
            return getBalance(event);
            
        case 'createAccount':
            return createAccount();
        
        case 'transfer':
            return transfer(event);
            
        default:
            return {
                statusCode: 400,
                body: `Invalid action: '${event.action}'`
            }
    }
}

const getBalance = async event => {
    if (!event || !event.address) {
        return {
            statusCode: 400,
            body: "getBalance: Missing address"
        }
    }
    
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(event.address)
        .then(res => {
            let balance = web3.utils.fromWei(res, 'ether');
            resolve(balance);
        }).catch(err => {
            reject(err);
        }); 
    });
};

const createAccount = () => {
    const account = web3.eth.accounts.create();

    return {
        statusCode: 200,
        body: {
            address: account.address,
            privateKey: account.privateKey
        }
    }
}

const transfer = async event => {
    if (!event || !event.toAddress) {
        return {
            statusCode: 400,
            body: `transfer: Missing fromAddress (${event.fromAddress}) or toAddress (${event.toAddress})`
        }
    }
    
    var privateKey = Buffer.from(process.env.ETH_PRIVATE_KEY.toLowerCase(), 'hex');
    
    let nonce = event.hasOwnProperty("nonce") 
        ? event.nonce 
        : await web3.eth.getTransactionCount(process.env.ETH_PUBLIC_KEY.toLowerCase(), "pending");
    
    // const estimatedGas = await web3.eth.estimateGas({
    //         "from"      : event.fromAddress,
    //         "nonce"     : nonce, 
    //         "to"        : event.toAddress
    //     });
    
    let gasPrice = await web3.eth.getGasPrice();
    
    var rawTx = {
        nonce: nonce,
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(8000000),
        to: event.toAddress,
        value: (300000000000000000 / 300)
    }
    
    var tx = new Tx(rawTx, {'chain':'ropsten'});
    tx.sign(privateKey);
    
    var serializedTx = tx.serialize();
    
    return new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('transactionHash', hash => {
            // console.log('hash', hash);
            
            resolve({
                statusCode: 200,
                body: {
                    txnHash: hash
                }
            });
        })
        .on('receipt', res => {
            // console.log('receipt', res);
            
            // resolve({
            //     statusCode: 200,
            //     body: res
            // });
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log('confirmationNumber', confirmationNumber, 'receipt', receipt);
            
            resolve({
                statusCode: 200,
                body: confirmationNumber
            });
        })
        .on('error', err => {
            console.error(err);
            
            reject(err)
        });
    });
};

const sendNFT = address => {
    
}
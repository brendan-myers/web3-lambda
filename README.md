# web3-lambda

🚨🚨🚨 Don't use this in production! This is for educational purposes 🧑‍🎓 No refunds 🚨🚨🚨

V. basic AWS Lambda front-end to Amazon Managed Blockchain.

## Pre-reqs

- AWS account
- Geth node setup in Amazon Managed Blockchain (AMB)
- AWS Lambda function with the following environment variables;
   - `AWS_ETH_NODE` : ID of your AMB node,
   - `ETH_PRIVATE_KEY` : Private key for your wallet (for sending funds)
   - `ETH_PUBLIC_KEY` : Public key for your wallet.

## Install

```
npm install
./deploy.sh
```
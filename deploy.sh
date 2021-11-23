#!/bin/bash

zip -r function.zip .
aws lambda update-function-code --function-name web3-getBalance --zip-file fileb://function.zip

# Cardano DApp Certification 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### React JS demo

In the project directory, you can run: `npm start run`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


### What is this useful for:
You can use this code as a starting point for the following:
- Create a certification/ diploma on the Cardano blockchain 

This boilerplate code was written in javascript and React Js, so caters to the devs who already use this framework.

### How does it work:
- It uses the wallet connector standard CIP30 and the cardano-serialization-lib
- the CIP30 standard has been implemented by Nami, CCvault and Flint
- It uses the cardano-serializatioon-lib to build transactions in the javascript front-end, then sign them and send the transactrons with the user's wallet
- you can clone the git repo and then `npm install` and `npm start run` to start a local session

### What does it do:
- Create an organization profile
- Create a diploma/certification 
- Create a promotion that can include multiple students
All information is stored in Cardano metadata using self transaction 


### Troubleshooting
- If you get an error that starts with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory ...` then run this `export NODE_OPTIONS="--max-old-space-size=8192"` before runnig `npm start`
- If you get an error that starts with ` Not enough ADA leftover to include non-ADA assets in a change address ...` then first make sure that you have enough ADA in your wallet and then try changing the "strategy" number in this part of the code `txBuilder.add_inputs_from(txUnspentOutputs, 1)` which determines how it selects available UTXOs from your wallet. The options are `0` for LargestFirst, `1` for RandomImprove, `2` for LargestFirstMultiAsset and `3` for RandomImproveMultiAsset 
- Requires Nodejs version v14 or higher


### Guide on the Cardano Developer Portal
Explanation of the different section of the code

https://developers.cardano.org/docs/get-started/cardano-serialization-lib/create-react-app 

### Useful Links

These links serve as example of how to use the cardano-serialization-lib and where you can find code snippets

Implements the CIP30: https://cips.cardano.org/cips/cip30/

Uses the cardano-serialization-lib:

Link1: https://docs.cardano.org/cardano-components/cardano-serialization-lib

Link2: https://github.com/Emurgo/cardano-serialization-lib

NFT implementation: https://github.com/MartifyLabs/martify.frontend

Nami implementation: https://github.com/Berry-Pool/nami-wallet

Wallet interface: https://github.com/HarmonicPool/cardano-wallet-interface

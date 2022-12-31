import React, { useImperativeHandle } from 'react'
import Tx from './tx.json'
import User from './user.json'
import { Tab, Tabs, RadioGroup, Radio, FormGroup, InputGroup, NumericInput, isRefObject } from "@blueprintjs/core";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/normalize.css/normalize.css";
import {
    Address,
    BaseAddress,
    MultiAsset,
    Assets,
    ScriptHash,
    Costmdls,
    Language,
    CostModel,
    AssetName,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionOutput,
    Value,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    TransactionOutputBuilder,
    LinearFee,
    BigNum,
    BigInt,
    TransactionHash,
    TransactionInputs,
    TransactionInput,
    TransactionWitnessSet,
    Transaction,
    PlutusData,
    PlutusScripts,
    PlutusScript,
    PlutusList,
    Redeemers,
    Redeemer,
    RedeemerTag,
    Ed25519KeyHashes,
    ConstrPlutusData,
    ExUnits,
    Int,
    NetworkInfo,
    EnterpriseAddress,
    TransactionOutputs,
    hash_transaction,
    hash_script_data,
    hash_plutus_data,
    ScriptDataHash, Ed25519KeyHash, NativeScript, StakeCredential,
    MetadataMap,
    TransactionMetadatum,
    TransactionMetadatumLabels,
        MetadataList,   
    AuxiliaryData,
    GeneralTransactionMetadata
} from "@emurgo/cardano-serialization-lib-asmjs"
import "./App.css";
import {blake2b} from "blakejs";
let Buffer = require('buffer/').Buffer
let blake = require('blakejs')
var assetList = []; 
var assetListHex = []; 
var policyList = []; 

const mainnet = "mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag"


var productList =[];
var profileList =[];

var batchList=[];
var studentList=[];

var objSelected=
{
    quantity:"",
    prevTx:"",
    itemTx:"",

}; 
var prodSelected=
{
    name:"",
    id:"",
    itemTx:"",

}; 
var certlist =[] ; 
var operations =[]; 
var stakeTest = "stake_test1uzh66rrhqw6xnmgzzwecfay88qj82dldkqnxzv24vsd2jlc5pgmhx"

var students ; 
var opChoice =0; 
var prodChoice, batchChoice; 

var addressL=[]; 

export default class App extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            selectedTabId: "1",
            whichWalletSelected: undefined,
            walletFound: false,
            walletIsEnabled: false,
            walletName: undefined,
            walletIcon: undefined,
            walletAPIVersion: undefined,
            wallets: [],

            networkId: undefined,
            Utxos: undefined,
            CollatUtxos: undefined,
            balance: undefined,
            changeAddress: undefined,
            rewardAddress: undefined,
            usedAddress: undefined,

            txBody: undefined,
            txBodyCborHex_unsigned: "",
            txBodyCborHex_signed: "",
            submittedTxHash: "",

            addressBech32SendADA: "addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm",
            lovelaceToSend: 1000000,
            transferQuantity: 100, 
            assetNameHex: "4c494645",
            assetPolicyIdHex: "ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f",
            assetAmountToSend: 5,
            addressScriptBech32: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
            datumStr: "12345678",
            plutusScriptCborHex: "4e4d01000033222220051200120011",
            transactionIdLocked: "",
            transactionIndxLocked: 0,
            lovelaceLocked: 3000000,
            manualFee: 900000,

            batch:"X12345678"

        }

        /**
         * When the wallet is connect it returns the connector which is
         * written to this API variable and all the other operations
         * run using this API object
         */
        this.API = undefined;

        /**
         * Protocol parameters
         * @type {{
         * keyDeposit: string,
         * coinsPerUtxoWord: string,
         * minUtxo: string,
         * poolDeposit: string,
         * maxTxSize: number,
         * priceMem: number,
         * maxValSize: number,
         * linearFee: {minFeeB: string, minFeeA: string}, priceStep: number
         * }}
         */
        this.protocolParams = {
            linearFee: {
                minFeeA: "44",
                minFeeB: "155381",
            },
            minUtxo: "34482",
            poolDeposit: "500000000",
            keyDeposit: "2000000",
            maxValSize: 5000,
            maxTxSize: 16384,
            priceMem: 0.0577,
            priceStep: 0.0000721,
            coinsPerUtxoWord: "34482",
        }

        this.pollWallets = this.pollWallets.bind(this);
    }

    /**
     * Poll the wallets it can read from the browser.
     * Sometimes the html document loads before the browser initialized browser plugins (like Nami or Flint).
     * So we try to poll the wallets 3 times (with 1 second in between each try).
     *
     * Note: CCVault and Eternl are the same wallet, Eternl is a rebrand of CCVault
     * So both of these wallets as the Eternl injects itself twice to maintain
     * backward compatibility
     *
     * @param count The current try count.
     */
    pollWallets = (count = 0) => {
        const wallets = [];
        for(const key in window.cardano) {
            if (window.cardano[key].enable && wallets.indexOf(key) === -1) {
                wallets.push(key);
            }
        }
        if (wallets.length === 0 && count < 3) {
            setTimeout(() => {
                this.pollWallets(count + 1);
            }, 1000);
            return;
        }
        this.setState({
            wallets,
            whichWalletSelected: wallets[0]
        }, () => {
            this.refreshData()
        });
    }

    /**
     * Handles the tab selection on the user form
     * @param tabId
     */
    handleTabId = (tabId) => this.setState({selectedTabId: tabId})

    /**
     * Handles the radio buttons on the form that
     * let the user choose which wallet to work with
     * @param obj
     */
    handleWalletSelect = (obj) => {
        const whichWalletSelected = obj.target.value
        this.setState({whichWalletSelected},
            () => {
                this.refreshData()
            })
    }

    /**
     * Generate address from the plutus contract cborhex
     */
    generateScriptAddress = () => {
        // cborhex of the alwayssucceeds.plutus
        // const cborhex = "4e4d01000033222220051200120011";
        // const cbor = Buffer.from(cborhex, "hex");
        // const blake2bhash = blake.blake2b(cbor, 0, 28);

        const script = PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))
        // const blake2bhash = blake.blake2b(script.to_bytes(), 0, 28);
        const blake2bhash = "67f33146617a5e61936081db3b2117cbf59bd2123748f58ac9678656";
        const scripthash = ScriptHash.from_bytes(Buffer.from(blake2bhash,"hex"));

        const cred = StakeCredential.from_scripthash(scripthash);
        const networkId = NetworkInfo.testnet().network_id();
        const baseAddr = EnterpriseAddress.new(networkId, cred);
        const addr = baseAddr.to_address();
        const addrBech32 = addr.to_bech32();

        // hash of the address generated from script
        console.log(Buffer.from(addr.to_bytes(), "utf8").toString("hex"))

        // hash of the address generated using cardano-cli
        const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
        console.log(Buffer.from(ScriptAddress.to_bytes(), "utf8").toString("hex"))


        console.log(ScriptAddress.to_bech32())
        console.log(addrBech32)

    }

    /**
     * Checks if the wallet is running in the browser
     * Does this for Nami, Eternl and Flint wallets
     * @returns {boolean}
     */

    checkIfWalletFound = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletFound = !!window?.cardano?.[walletKey];
        this.setState({walletFound})
        return walletFound;
    }

    /**
     * Checks if a connection has been established with
     * the wallet
     * @returns {Promise<boolean>}
     */
    checkIfWalletEnabled = async () => {
        let walletIsEnabled = false;

        try {
            const walletName = this.state.whichWalletSelected;
            walletIsEnabled = await window.cardano[walletName].isEnabled();
        } catch (err) {
            console.log(err)
        }
        this.setState({walletIsEnabled});

        return walletIsEnabled;
    }

    /**
     * Enables the wallet that was chosen by the user
     * When this executes the user should get a window pop-up
     * from the wallet asking to approve the connection
     * of this app to the wallet
     * @returns {Promise<boolean>}
     */

    enableWallet = async () => {
        const walletKey = this.state.whichWalletSelected;
        try {
            this.API = await window.cardano[walletKey].enable();
        } catch(err) {
            console.log(err);
        }
        return this.checkIfWalletEnabled();
    }

    /**
     * Get the API version used by the wallets
     * writes the value to state
     * @returns {*}
     */
    getAPIVersion = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletAPIVersion = window?.cardano?.[walletKey].apiVersion;
        this.setState({walletAPIVersion})
        return walletAPIVersion;
    }

    /**
     * Get the name of the wallet (nami, eternl, flint)
     * and store the name in the state
     * @returns {*}
     */

    getWalletName = () => {
        const walletKey = this.state.whichWalletSelected;
        const walletName = window?.cardano?.[walletKey].name;
        this.setState({walletName})
        return walletName;
    }

    /**
     * Gets the Network ID to which the wallet is connected
     * 0 = testnet
     * 1 = mainnet
     * Then writes either 0 or 1 to state
     * @returns {Promise<void>}
     */
    getNetworkId = async () => {
        try {
            const networkId = await this.API.getNetworkId();
            this.setState({networkId})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Gets the UTXOs from the user's wallet and then
     * stores in an object in the state
     * @returns {Promise<void>}
     */

    getUtxos = async () => {

        let Utxos = [];

        try {
            const rawUtxos = await this.API.getUtxos();

            for (const rawUtxo of rawUtxos) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
                const input = utxo.input();
                const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
                const txindx = input.index();
                const output = utxo.output();
                const amount = output.amount().coin().to_str(); // ADA amount in lovelace
                const multiasset = output.amount().multiasset();
                let multiAssetStr = "";

                if (multiasset) {
                    const keys = multiasset.keys() // policy Ids of thee multiasset
                    const N = keys.len();
                    // console.log(`${N} Multiassets in the UTXO`)


                    for (let i = 0; i < N; i++){
                        const policyId = keys.get(i);
                        const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
                        // console.log(`policyId: ${policyIdHex}`)
                        const assets = multiasset.get(policyId)
                        const assetNames = assets.keys();
                        const K = assetNames.len()
                        // console.log(`${K} Assets in the Multiasset`)

                        for (let j = 0; j < K; j++) {
                            const assetName = assetNames.get(j);
                            const assetNameString = Buffer.from(assetName.name(),"utf8").toString();
                            const assetNameHex = Buffer.from(assetName.name(),"utf8").toString("hex")
                            const multiassetAmt = multiasset.get_asset(policyId, assetName)
                            multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
                            // console.log(assetNameString)
                            // console.log(`Asset Name: ${assetNameHex}`)
                            assetList.push(assetNameString);
                            assetListHex.push(assetNameHex);
                            policyList.push(policyIdHex);
                        }
                    }
                }


                const obj = {
                    txid: txid,
                    txindx: txindx,
                    amount: amount,
                    str: `${txid} #${txindx} = ${amount}`,
                    multiAssetStr: multiAssetStr,
                    TransactionUnspentOutput: utxo
                }
                Utxos.push(obj);
                // console.log(`utxo: ${str}`)
            }
            this.setState({Utxos})
        } catch (err) {
            console.log(err)
        }
    }

  /* getTokenList = () => {
    
  






    /**
     * The collateral is need for working with Plutus Scripts
     * Essentially you need to provide collateral to pay for fees if the
     * script execution fails after the script has been validated...
     * this should be an uncommon occurrence and would suggest the smart contract
     * would have been incorrectly written.
     * The amount of collateral to use is set in the wallet
     * @returns {Promise<void>}
     */
    getCollateral = async () => {

        let CollatUtxos = [];

        try {

            let collateral = [];

            const wallet = this.state.whichWalletSelected;
            if (wallet === "nami") {
                collateral = await this.API.experimental.getCollateral();
            } else {
                collateral = await this.API.getCollateral();
            }

            for (const x of collateral) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, "hex"));
                CollatUtxos.push(utxo)
                // console.log(utxo)
            }
            this.setState({CollatUtxos})
        } catch (err) {
            console.log(err)
        }

    }

    /**
     * Gets the current balance of in Lovelace in the user's wallet
     * This doesnt resturn the amounts of all other Tokens
     * For other tokens you need to look into the full UTXO list
     * @returns {Promise<void>}
     */
    getBalance = async () => {
        try {
            const balanceCBORHex = await this.API.getBalance();

            const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
            this.setState({balance})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Get the address from the wallet into which any spare UTXO should be sent
     * as change when building transactions.
     * @returns {Promise<void>}
     */
    getChangeAddress = async () => {
        try {
            const raw = await this.API.getChangeAddress();
            const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
            this.setState({changeAddress})
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * This is the Staking address into which rewards from staking get paid into
     * @returns {Promise<void>}
     */
    getRewardAddresses = async () => {

        try {
            const raw = await this.API.getRewardAddresses();
            const rawFirst = raw[0];
            const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({rewardAddress})


        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Gets previsouly used addresses
     * @returns {Promise<void>}
     */
    getUsedAddresses = async () => {

        try {
            addressL=[];
            const raw = await this.API.getUsedAddresses();
           
            const rawFirst = raw[0];
            const usedAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
             
            raw.forEach(ad => 
                {
                    addressL.push(Address.from_bytes(Buffer.from(ad, "hex")).to_bech32())
                }
                )
  
            // console.log(rewardAddress)
            console.log(addressL)
            this.setState({usedAddress})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Refresh all the data from the user's wallet
     * @returns {Promise<void>}
     */
    refreshData = async () => {
        this.generateScriptAddress()

        try{
            const walletFound = this.checkIfWalletFound();
            if (walletFound) {
                await this.getAPIVersion();
                await this.getWalletName();
                const walletEnabled = await this.enableWallet();
                if (walletEnabled) {
                    await this.getNetworkId();
                    await this.getUtxos();
                    await this.getCollateral();
                    await this.getBalance();
                    await this.getChangeAddress();
                    await this.getRewardAddresses();
                    await this.getUsedAddresses();
                } else {
                    await this.setState({
                        Utxos: null,
                        CollatUtxos: null,
                        balance: null,
                        changeAddress: null,
                        rewardAddress: null,
                        usedAddress: null,

                        txBody: null,
                        txBodyCborHex_unsigned: "",
                        txBodyCborHex_signed: "",
                        submittedTxHash: "",
                    });
                }
            } else {
                await this.setState({
                    walletIsEnabled: false,

                    Utxos: null,
                    CollatUtxos: null,
                    balance: null,
                    changeAddress: null,
                    rewardAddress: null,
                    usedAddress: null,

                    txBody: null,
                    txBodyCborHex_unsigned: "",
                    txBodyCborHex_signed: "",
                    submittedTxHash: "",
                });
            }
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Every transaction starts with initializing the
     * TransactionBuilder and setting the protocol parameters
     * This is boilerplate
     * @returns {Promise<TransactionBuilder>}
     */
    initTransactionBuilder = async () => {

        const txBuilder = TransactionBuilder.new(
            TransactionBuilderConfigBuilder.new()
                .fee_algo(LinearFee.new(BigNum.from_str(this.protocolParams.linearFee.minFeeA), BigNum.from_str(this.protocolParams.linearFee.minFeeB)))
                .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
                .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
                .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
                .max_value_size(this.protocolParams.maxValSize)
                .max_tx_size(this.protocolParams.maxTxSize)
                .prefer_pure_change(true)
                .build()
        );

        return txBuilder
    }

    /**
     * Builds an object with all the UTXOs from the user's wallet
     * @returns {Promise<TransactionUnspentOutputs>}
     */
    getTxUnspentOutputs = async () => {
        let txOutputs = TransactionUnspentOutputs.new()
        for (const utxo of this.state.Utxos) {
            txOutputs.add(utxo.TransactionUnspentOutput)
        }
        return txOutputs
    }

    /**
     * The transaction is build in 3 stages:
     * 1 - initialize the Transaction Builder
     * 2 - Add inputs and outputs
     * 3 - Calculate the fee and how much change needs to be given
     * 4 - Build the transaction body
     * 5 - Sign it (at this point the user will be prompted for
     * a password in his wallet)
     * 6 - Send the transaction
     * @returns {Promise<void>}
     */
    buildSendADATransaction = async () => {
        let a = document.getElementById("idP").value
        let b = document.getElementById("productP").value
let c = document.getElementById("imageP").value
let d = document.getElementById("degreeP").value
let e = document.getElementById("issuerP").value 

          let m = document.getElementById("descriptionP")
       var imes = m.value

      
      
var ty = imes.match(/.{1,64}/g);
console.log(ty)



        const txBuilder = await this.initTransactionBuilder();
        //const shelleyOutputAddress = Address.from_bech32(this.state.changeAddress);
        const shelleyOutputAddress = Address.from_bech32(this.state.changeAddress);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
            ),
        );

       
       /* const map = MetadataMap.new();
        map.insert(
            TransactionMetadatum.new_text("msg"),
           // TransactionMetadatum.new_text("resm")
           TransactionMetadatum.new_list(tags),
          );

          const metadatum = TransactionMetadatum.new_map(map); */ 

          var beta= 
          {
            "operation": "BC", 

          }
        
          var meta = {
            "id":a,
            "degree":d,
            "name": b,
            "image": c,
            "issuer":e,
         "description":ty
            }

            console.log(meta)
       /* const metadatum = TransactionMetadatum.encode_json_str_to_metadatum
        .encode_json_str_to_metadatum(JSON.stringify(obj),MetadataJsonSchema.NoConversions)*/
    

           txBuilder.add_json_metadatum(
                BigNum.from_str("200"),
                JSON.stringify(meta)
            );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 1)
        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const unsignedTransaction = txBuilder.build_tx();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
         //  AuxiliaryData.from_bytes(metadatum2.to_bytes())
         unsignedTransaction.auxiliary_data()
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);

        console.log(txVkeyWitnesses)

        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet,
         //   AuxiliaryData.from_bytes(metadatum2.to_bytes())
         unsignedTransaction.auxiliary_data()

        );


        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash})

    }




    buildSendADATransactionB = async () => {
        let stds =[]; 
        let e = document.getElementById("product")    
       var a = e.options[e.selectedIndex].value;
alert(a)

        let b = document.getElementById("batchCid").value
        let c = document.getElementById("name").value
    let m = document.getElementById("descriptionV")
       var imes = m.value

        var elms = document.querySelectorAll("[id='stud']");
        var name = document.querySelectorAll("[id='nameC']");
        var id = document.querySelectorAll("[id='idC']");
        var note = document.querySelectorAll("[id='noteC']");
        var srl = document.querySelectorAll("[id='serialC']");




        elms.forEach((y,i) => 
            {
            let x=
                {
                    name: name[i].value, 
                    id: id[i].value,
                    note: note[i].value,
                    serial:srl[i].value
            } 
            stds.push(x)
            }
            )


      

      
      
var ty = imes.match(/.{1,64}/g);
console.log(ty)

const tags= MetadataList.new()



        const txBuilder = await this.initTransactionBuilder();
        //const shelleyOutputAddress = Address.from_bech32(this.state.changeAddress);
        const shelleyOutputAddress = Address.from_bech32(this.state.changeAddress);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
            ),
        );

       
       /* const map = MetadataMap.new();
        map.insert(
            TransactionMetadatum.new_text("msg"),
           // TransactionMetadatum.new_text("resm")
           TransactionMetadatum.new_list(tags),
          );

          const metadatum = TransactionMetadatum.new_map(map); */ 

          var beta= 
          {
            "operation": "BC", 

          }
        
          var meta = {
            "certificate":a,
            "id": b,
            "name": c,
            "description": ty,
         "students":stds
            }

            console.log(meta)
       /* const metadatum = TransactionMetadatum.encode_json_str_to_metadatum
        .encode_json_str_to_metadatum(JSON.stringify(obj),MetadataJsonSchema.NoConversions)*/
    

           txBuilder.add_json_metadatum(
                BigNum.from_str("200"),
                JSON.stringify(meta)
            );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 1)
        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const unsignedTransaction = txBuilder.build_tx();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
         //  AuxiliaryData.from_bytes(metadatum2.to_bytes())
         unsignedTransaction.auxiliary_data()
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);

        console.log(txVkeyWitnesses)

        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet,
         //   AuxiliaryData.from_bytes(metadatum2.to_bytes())
         unsignedTransaction.auxiliary_data()

        );


        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash})

    }

    updateProfile = async () => {
        let a = document.getElementById("name").value
        let b = document.getElementById("loc").value
let c = document.getElementById("image").value
let d = document.getElementById("website").value

          let m = document.getElementById("description")
       var imes = m.value

      
      
var ty = imes.match(/.{1,64}/g);
console.log(ty)


        const txBuilder = await this.initTransactionBuilder();
        //const shelleyOutputAddress = Address.from_bech32(this.state.changeAddress);
        const shelleyOutputAddress = Address.from_bech32(this.state.changeAddress);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
            ),
        );

       
       /* const map = MetadataMap.new();
        map.insert(
            TransactionMetadatum.new_text("msg"),
           // TransactionMetadatum.new_text("resm")
           TransactionMetadatum.new_list(tags),
          );

          const metadatum = TransactionMetadatum.new_map(map); */ 

          var beta= 
          {
            "operation": "BC", 

          }
        
          var meta = {
            "institution":a,
            "location": b,
            "image": c,
         "description":ty,
         "website":d,
         "object":"profile"

            }

            console.log(meta)
       /* const metadatum = TransactionMetadatum.encode_json_str_to_metadatum
        .encode_json_str_to_metadatum(JSON.stringify(obj),MetadataJsonSchema.NoConversions)*/
    

           txBuilder.add_json_metadatum(
                BigNum.from_str("200"),
                JSON.stringify(meta)
            );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 1)
        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const unsignedTransaction = txBuilder.build_tx();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
         //  AuxiliaryData.from_bytes(metadatum2.to_bytes())
         unsignedTransaction.auxiliary_data()
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);

        console.log(txVkeyWitnesses)

        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet,
         //   AuxiliaryData.from_bytes(metadatum2.to_bytes())
         unsignedTransaction.auxiliary_data()

        );


        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash})

    }


    buildSendTokenTransaction = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
        txOutputBuilder = txOutputBuilder.next();

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
            BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
            assets
        );

        txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 3)


        // set the time to live - the absolute slot value before the tx becomes invalid
        // txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});

        // const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        // this.setState({txBodyCborHex_unsigned, txBody})

    }



    buildSendAdaToPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();

        txOutputBuilder = txOutputBuilder.with_value(Value.new(BigNum.from_str(this.state.lovelaceToSend.toString())))
        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 2)


        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash: submittedTxHash, transactionIdLocked: submittedTxHash, lovelaceLocked: this.state.lovelaceToSend});


    }

    buildSendTokenToPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();




        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
            BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
            assets
        );

        // txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))

        txOutputBuilder = txOutputBuilder.with_coin_and_asset(BigNum.from_str(this.state.lovelaceToSend.toString()),multiAsset)

        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 3)





        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash: submittedTxHash, transactionIdLocked: submittedTxHash, lovelaceLocked: this.state.lovelaceToSend})

    }




    buildRedeemAdaFromPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        txBuilder.add_input(
            ScriptAddress,
            TransactionInput.new(
                TransactionHash.from_bytes(Buffer.from(this.state.transactionIdLocked, "hex")),
                this.state.transactionIndxLocked.toString()),
            Value.new(BigNum.from_str(this.state.lovelaceLocked.toString()))) // how much lovelace is at that UTXO

        txBuilder.set_fee(BigNum.from_str(Number(this.state.manualFee).toString()))

        const scripts = PlutusScripts.new();
        scripts.add(PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))); //from cbor of plutus script

        // Add outputs
        const outputVal = this.state.lovelaceLocked.toString() - Number(this.state.manualFee)
        const outputValStr = outputVal.toString();
        txBuilder.add_output(TransactionOutput.new(shelleyChangeAddress, Value.new(BigNum.from_str(outputValStr))))


        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const collateral = this.state.CollatUtxos;
        const inputs = TransactionInputs.new();
        collateral.forEach((utxo) => {
            inputs.add(utxo.input());
        });

        let datums = PlutusList.new();
        // datums.add(PlutusData.from_bytes(Buffer.from(this.state.datumStr, "utf8")))
        datums.add(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))

        const redeemers = Redeemers.new();

        const data = PlutusData.new_constr_plutus_data(
            ConstrPlutusData.new(
                BigNum.from_str("0"),
                PlutusList.new()
            )
        );

        const redeemer = Redeemer.new(
            RedeemerTag.new_spend(),
            BigNum.from_str("0"),
            data,
            ExUnits.new(
                BigNum.from_str("7000000"),
                BigNum.from_str("3000000000")
            )
        );

        redeemers.add(redeemer)

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        transactionWitnessSet.set_plutus_scripts(scripts)
        transactionWitnessSet.set_plutus_data(datums)
        transactionWitnessSet.set_redeemers(redeemers)

        // Pre Vasil hard fork cost model
        // const cost_model_vals = [
        //     197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000,
        //     0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100,
        //     29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000,
        //     32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000,
        //     425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000,
        //     10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32,
        //     150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1,
        //     145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000,
        //     32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0,
        //     1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1,
        //     2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0,
        //     1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32,
        //     150000, 32, 3345831, 1, 1
        // ];

        /*
        Post Vasil hard fork cost model
        If you need to make this code work on the Mainnet, before Vasil hard-fork
        Then you need to comment this section below and uncomment the cost model above
        Otherwise it will give errors when redeeming from Scripts
        Sending assets and ada to Script addresses is unaffected by this cost model
         */
        const cost_model_vals = [
            205665, 812, 1, 1, 1000, 571, 0, 1, 1000, 24177, 4, 1, 1000, 32, 117366,
            10475, 4, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000,
            100, 100, 100, 23000, 100, 19537, 32, 175354, 32, 46417, 4, 221973, 511, 0, 1,
            89141, 32, 497525, 14068, 4, 2, 196500, 453240, 220, 0, 1, 1, 1000, 28662, 4,
            2, 245000, 216773, 62, 1, 1060367, 12586, 1, 208512, 421, 1, 187000, 1000,
            52998, 1, 80436, 32, 43249, 32, 1000, 32, 80556, 1, 57667, 4, 1000, 10,
            197145, 156, 1, 197145, 156, 1, 204924, 473, 1, 208896, 511, 1, 52467, 32,
            64832, 32, 65493, 32, 22558, 32, 16563, 32, 76511, 32, 196500, 453240, 220, 0,
            1, 1, 69522, 11687, 0, 1, 60091, 32, 196500, 453240, 220, 0, 1, 1, 196500,
            453240, 220, 0, 1, 1, 806990, 30482, 4, 1927926, 82523, 4, 265318, 0, 4, 0,
            85931, 32, 205665, 812, 1, 1, 41182, 32, 212342, 32, 31220, 32, 32696, 32,
            43357, 32, 32247, 32, 38314, 32, 9462713, 1021, 10,
        ];

        const costModel = CostModel.new();
        cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));


        const costModels = Costmdls.new();
        costModels.insert(Language.new_plutus_v1(), costModel);

        const scriptDataHash = hash_script_data(redeemers, costModels, datums);
        txBody.set_script_data_hash(scriptDataHash);

        txBody.set_collateral(inputs)


        const baseAddress = BaseAddress.from_address(shelleyChangeAddress)
        const requiredSigners = Ed25519KeyHashes.new();
        requiredSigners.add(baseAddress.payment_cred().to_keyhash())

        txBody.set_required_signers(requiredSigners);

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});

    }

    buildRedeemTokenFromPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
            BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
        );

        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
            assets
        );

        txBuilder.add_input(
            ScriptAddress,
            TransactionInput.new(
                TransactionHash.from_bytes(Buffer.from(this.state.transactionIdLocked, "hex")),
                this.state.transactionIndxLocked.toString()),
            Value.new_from_assets(multiAsset)
        ) // how much lovelace is at that UTXO


        txBuilder.set_fee(BigNum.from_str(Number(this.state.manualFee).toString()))

        const scripts = PlutusScripts.new();
        scripts.add(PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))); //from cbor of plutus script


        // Add outputs
        const outputVal = this.state.lovelaceLocked.toString() - Number(this.state.manualFee)
        const outputValStr = outputVal.toString();

        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(shelleyChangeAddress);
        txOutputBuilder = txOutputBuilder.next();
        txOutputBuilder = txOutputBuilder.with_coin_and_asset(BigNum.from_str(outputValStr),multiAsset)

        const txOutput = txOutputBuilder.build();
        txBuilder.add_output(txOutput)


        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const collateral = this.state.CollatUtxos;
        const inputs = TransactionInputs.new();
        collateral.forEach((utxo) => {
            inputs.add(utxo.input());
        });



        let datums = PlutusList.new();
        // datums.add(PlutusData.from_bytes(Buffer.from(this.state.datumStr, "utf8")))
        datums.add(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))

        const redeemers = Redeemers.new();

        const data = PlutusData.new_constr_plutus_data(
            ConstrPlutusData.new(
                BigNum.from_str("0"),
                PlutusList.new()
            )
        );

        const redeemer = Redeemer.new(
            RedeemerTag.new_spend(),
            BigNum.from_str("0"),
            data,
            ExUnits.new(
                BigNum.from_str("7000000"),
                BigNum.from_str("3000000000")
            )
        );

        redeemers.add(redeemer)

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        transactionWitnessSet.set_plutus_scripts(scripts)
        transactionWitnessSet.set_plutus_data(datums)
        transactionWitnessSet.set_redeemers(redeemers)

        // Pre Vasil hard fork cost model
        // const cost_model_vals = [197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32, 150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 3345831, 1, 1];

        /*
        Post Vasil hard fork cost model
        If you need to make this code work on the Mainnnet, before Vasil hard-fork
        Then you need to comment this section below and uncomment the cost model above
        Otherwise it will give errors when redeeming from Scripts
        Sending assets and ada to Script addresses is unaffected by this cost model
         */
        const cost_model_vals = [
            205665, 812, 1, 1, 1000, 571, 0, 1, 1000, 24177, 4, 1, 1000, 32, 117366,
            10475, 4, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000,
            100, 100, 100, 23000, 100, 19537, 32, 175354, 32, 46417, 4, 221973, 511, 0, 1,
            89141, 32, 497525, 14068, 4, 2, 196500, 453240, 220, 0, 1, 1, 1000, 28662, 4,
            2, 245000, 216773, 62, 1, 1060367, 12586, 1, 208512, 421, 1, 187000, 1000,
            52998, 1, 80436, 32, 43249, 32, 1000, 32, 80556, 1, 57667, 4, 1000, 10,
            197145, 156, 1, 197145, 156, 1, 204924, 473, 1, 208896, 511, 1, 52467, 32,
            64832, 32, 65493, 32, 22558, 32, 16563, 32, 76511, 32, 196500, 453240, 220, 0,
            1, 1, 69522, 11687, 0, 1, 60091, 32, 196500, 453240, 220, 0, 1, 1, 196500,
            453240, 220, 0, 1, 1, 806990, 30482, 4, 1927926, 82523, 4, 265318, 0, 4, 0,
            85931, 32, 205665, 812, 1, 1, 41182, 32, 212342, 32, 31220, 32, 32696, 32,
            43357, 32, 32247, 32, 38314, 32, 9462713, 1021, 10,
        ];

        const costModel = CostModel.new();
        cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));


        const costModels = Costmdls.new();
        costModels.insert(Language.new_plutus_v1(), costModel);

        const scriptDataHash = hash_script_data(redeemers, costModels, datums);
        txBody.set_script_data_hash(scriptDataHash);

        txBody.set_collateral(inputs)


        const baseAddress = BaseAddress.from_address(shelleyChangeAddress)
        const requiredSigners = Ed25519KeyHashes.new();
        requiredSigners.add(baseAddress.payment_cred().to_keyhash())

        txBody.set_required_signers(requiredSigners);

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});

    }




    loadTX()
    {
     var obj; 
     var xmp = new XMLHttpRequest();
xmp.open("GET", "https://cardano-mainnet.blockfrost.io/api/v0/metadata/txs/labels/200", false); // false for synchronous request
xmp.setRequestHeader("project_id", mainnet);
xmp.send();
var content2 = JSON.parse(xmp.responseText);
console.log(content2.length);
      content2.forEach(story => 
        {
            try
            {
                console.log(story);
         
                if (story.json_metadata.degree)
             { 
                let a = this.returnIO(story.tx_hash)
                obj =
              {
                tx: story.tx_hash,
                address: a.inputs[0].address,
                itemTx: story.tx_hash,
                name : story.json_metadata.name,
                id : story.json_metadata.id,
                description : story.json_metadata.description,
                image : "https://ipfs.io/ipfs/"+story.json_metadata.image, 
                createdOn : story.blocktime
              } 
              console.log('PC');
              console.log(obj.address);
              productList.push(obj);
              certlist.push(obj.tx)}
              if (story.json_metadata.object == "profile")
              { 
                let a = this.returnIO(story.tx_hash)
                obj =
               {
                 tx: story.tx_hash,
                 address: a.inputs[0].address,
                 name : story.json_metadata.institution,
                 description: story.json_metadata.description, 
                 location : story.json_metadata.location,
                 image : "https://ipfs.io/ipfs/"+story.json_metadata.image, 
                 createdOn : story.blocktime
               } 
               console.log('ProfC');
               profileList.push(obj);}
               


                if (certlist.includes(story.json_metadata.certificate))
                {
                obj =
                 {
                    tx: story.tx_hash,
                   itemTx: story.json_metadata.certificate,
                   name : story.json_metadata.description,
                   id : story.json_metadata.id,
                   description : story.json_metadata.description, 
                   createdOn : story.blocktime,
                   student: story.json_metadata.students
                 } 
                 console.log('P');
                 console.log(obj.itemTx);
                 batchList.push(obj);
                 story.json_metadata.students.forEach(x => {
               let stds= 
                    {
                        "tx": story.tx_hash,
                        "name":x.name,
                        "id":x.id, 
                        "note":x.note, 
                        "serial":x.serial,
                        "certificateName":story.json_metadata.name,
                        "certificateDescription":story.json_metadata.description, 
                        "certificateID":story.json_metadata.id, 
                        "certificateItemTx":story.json_metadata.certificate
                    }
                    studentList.push(stds)
                console.log(stds);}
                
                    )
      
          } 
            }            
           catch
           {}

               
        })
        console.log(operations);

    }

    returnIO(hash)
    {
      let dataIO;
       var xhpd= new XMLHttpRequest();
        xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/txs/'+hash+'/utxos', false ); // false for synchronous request
      xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
        xhpd.send( null );
    try{
         dataIO = JSON.parse(xhpd.responseText)
    }
    catch{}
       return dataIO;
      
    }

    returnAddress(x)
    {
        var xhpd= new XMLHttpRequest();
         xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/accounts/'+x+'/addresses', false ); // false for synchronous request
       xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
         xhpd.send( null );
      
    }




    productChange(e)
    {
        productList.forEach(b => 
            {
                if(b.id == e)
                {
                 prodSelected=b;
                 console.log(objSelected.itemTx)
                }
            }
            )
            this.forceUpdate();

    }

    objectChange(e)
    {
        batchList.forEach(b => 
            {
                if(b.id == e)
                {
                 objSelected=b
                 console.log(objSelected.itemTx)
                }
            }
            )
            this.forceUpdate();

    }

    decodeUser(e)
    {
          let res;  User.forEach(u => 
            {
                if (u.user == e)
                res = u.username
            }
            )
            return res; 
    }



    encodeUser(e)
    {
        User.forEach(u => 
            {
                if (u.username == e)
                return u.user
            }
            )
    }




addStudent()
{
var a = document.getElementById('studentList')
a.insertAdjacentHTML('beforeend', 
"<div id='stud'>Student Name:<input id='nameC' type='text'></input> <br></br>Student ID:<input id='idC' type='text'></input><br></br>Diploma serial:<input id='serialC' type='text'></input> <br></br>Note:<textarea id='noteC' cols='40' rows='5'></textarea><br></br></div>")

}
    
removeStudent()
{
    var select = document.getElementById('studentList');
    select.removeChild(select.lastChild);
}
  
change(x)
{
    opChoice = x
    this.forceUpdate();
}

changeProd(x)
{
    prodChoice = x
    console.log(x)
    this.forceUpdate();
}

changeBatch(x)
{
    batchChoice = x
    this.forceUpdate();
}

    async componentDidMount() {
        this.pollWallets();
        await this.refreshData();
this.loadTX();    
//this.removeStudent(); 
}

    render()
    {

        return (
            <div style={{margin: "20px"}}>




               

               


                <Tabs id="TabsExample" vertical={false} onChange={this.handleTabId} selectedTabId={this.state.selectedTabId}>
                <Tab className="button-2" id="4" title="🔎 Search" panel={
                       <div className="timeline">

                    <h2> Database search </h2> 
                    <br></br>
                    <br></br> 
                    <div className='search'> 
                      
                        

                   <input type="text" placeholder="studentID"></input>  <br></br>
                     Search for Student ID 
                   </div> 
                   <br></br> 
                   <br></br> 
     
{
    studentList.map(std => (
      <div className='sdw'>    
 <p>{std.name} {'  '}
 <span className='inf'>{std.id}</span> </p> 
{
        productList.filter(prd => prd.tx == std.certificateItemTx).map(prd => (
        <div>
   
    <img src={prd.image}  width="200" height="200"></img> 
<details>
    <summary>    <p>{prd.name}{'  '} <span className='inf'>{prd.id}{' '}<a target="_blank" href={'https://cexplorer.io/tx/'+prd.tx}>🔗</a></span> </p></summary> 
    <p>{prd.description}</p> 
    </details> 
    
        </div> 
    ))
        } 
        <p>{std.serial}{'  '}<span><a target="_blank" href={'https://cexplorer.io/tx/'+std.tx}>🔗</a></span></p>
      

<p>{std.note}</p> 




</div> 

     ))
 }
 </div> 


                    } />
                    
                    
                    <Tab className="button-2" id="1" title="🏫 School" panel={
                        <div style={{marginLeft: "20px"}}>
                                                <h2> School </h2> 

{
       profileList.map(prd => (
         <div className='sdw'>    

   <h2> <img className='logo' src={prd.image}/> <span>{prd.name}{'  '} <a target="_blank" href={'https://cexplorer.io/tx/'+prd.tx}>🔗tx</a></span> </h2> 
    
     <p>{prd.description}</p> 
 {// <p>{prd.location}</p> 
 }
</div> 

        ))
    }

</div>
                    } />
                    <Tab className="button-2" id="2" title="🧑‍🎓 Certificate and promotion" panel={

<div style={{marginLeft: "20px"}}>
<h2> Diploma Editor </h2> 

   
        {
            opChoice == 0 &&
            <div> 
            <select onChange={(e) => this.changeProd(e.target.value)} className="dropdown-el">
            <option value='0'>-</option> 
       {
       productList.filter(function(prd) {return addressL.includes(prd.address)}).map(prd => (
            
    <option value={prd.tx}> {prd.name} </option>
        ))
    }
    </select>
    <a class='button-13' onClick={(e) => this.change("1")}>{' '}New certificate</a>

{
        productList.filter(prd => prd.tx == prodChoice).map(prd => (
        <div>
    <img src={prd.image}  width="200" height="200"></img>
    <p>{prd.name}
    <span className='inf'>{' '}{prd.id}</span></p> 
    </div> 
    ))
        }
{
productList.filter(prd => prd.tx == prodChoice).length!=0 &&
<div>

    <select className="dropdown-el" onChange={(e) => this.changeBatch(e.target.value)}>
    <option value='0'>-</option> 
    { batchList.filter(bth => bth.itemTx == prodChoice).map(bth => (
            <option value={bth.tx}> {bth.name} </option>
                ))
            }</select> <a class='button-13' onClick={(e) => this.change("2")}>{' '} New promotion</a>

    <ul>
    {batchList.filter(bth => bth.tx == batchChoice).map(bth => (
            <li>
    <p>{bth.name}
    </p> 

<p> Students: </p> 
<ul> 
    {  

        bth.student.map(
std=> 
(
  
  <li>
<p>{std.name} {' '}
  <span className='inf'>{std.id}</span></p>
  <p>{std.serial}</p>
<p>Result: {std.note}</p>
</li>

)
        )       
    }
    </ul> 
     </li>
        ))
    }</ul> 
    {

    }
    
  
    </div> 
    }

    </div>
        }

        {
            opChoice == 1 &&
            <div>  
           <a class='button-13' onClick={(e) => this.change("0")}>Back</a>       
                            <span className="tweet-user"> New Certificate </span>     <br></br>

Certificate ID: 
 <input id="idP" type="text"></input> <br></br>
Name: 
 <input id="productP" type="text"></input> <br></br>
 Image: 
 <input id="imageP" type="text"></input> <br></br>
 Degree: 
 <input id="degreeP" type="text"></input> <br></br>
 Issuer: 
 <input id="issuerP" type="text"></input> <br></br>
 Description: 
<textarea id="descriptionP" cols="40" rows="5"></textarea>
<br></br> 
<button class='button-30' style={{padding: "10px"}} onClick={this.buildSendADATransaction}>Create</button>
</div> 

        }
        {
              opChoice == 2 &&
              <div>     
       <a onClick={(e) => this.change("0")} class='button-13'>Back</a>                            
                            <span className="tweet-user"> New Promotion </span> 
                            <br></br>
 Select certificate: 
                            <select id="product"> 
                            <option>-</option>
                            {productList.map((item,index) => (
          <option value={item.itemTx}>{item.name}</option> 
                           ))}
                           </select>
                           <br></br>
 Promotion ID: 
 <input id="batchCid" type="text"></input> <br></br>
Promotion Name: 
 <input id="name" type="text"></input> <br></br>
 Description: 
<textarea id="descriptionV" cols="40" rows="5"></textarea>
<div id="studentList">
</div>

<button class='button-30' onClick={this.addStudent}>Add student</button>
<button class='button-30' onClick={this.removeStudent}>Remove student</button>


<button class='button-30' style={{padding: "10px"}} onClick={this.buildSendADATransactionB}>Create</button>


                             
</div> 
        }
     


</div>
                  
                    } />
                   <Tab className="button-2" id="3" title="📜 Logs" panel={

                       <div className="timeline">
                        <h2> Logs </h2> 
                       {
                         operations.map((tw =>                                  
                             <div key={tw} className="tweet">         
                              <div className="tweet-header">            
                              <span className="tweet-user">
                            "Create"/ "Promote"
                                </span> ·{' '}   
                               <span className="tweet-created-on">{new Date(tw.blocktime*1000).toLocaleString('en-US')}</span>{' '}·{' '} 
                               
                              </div>          
                              <div className="tweet-content"> {tw.quantity}{batchList[batchList.map(val => val.tx_hash).indexOf(tw.batchTx)].name} to {this.decodeUser(tw.receiver)}
                              {
                                tw.verifiedTx &&
                                <span className="tweet-content" style={{color:'blue'}}> - received ✓ </span>        
                              }   
                              </div>
                              </div>
                                 ))}
                             </div>
                    } />
                
                <Tab className="button-2" id="5" title="👤 Profile" panel={
                        <div style={{marginLeft: "20px"}}>
                                                <h2> Profile </h2> 

                                                <details>
    <summary> Wallet </summary>
                <div style={{paddingTop: "10px"}}>
                    <div style={{marginBottom: 15}}>Select wallet:</div>
                    <RadioGroup
                        onChange={this.handleWalletSelect}
                        selectedValue={this.state.whichWalletSelected}
                        inline={true}
                        className="wallets-wrapper"
                    >
                        { this.state.wallets.map(key =>
                            <Radio
                                key={key}
                                className="wallet-label"
                                value={key}>
                                <img src={window.cardano[key].icon} width={24} height={24} alt={key}/>
                                {window.cardano[key].name} ({key})
                            </Radio>
                        )}
                    </RadioGroup>
                </div>
                <button class='button-30' style={{padding: "20px"}} onClick={this.refreshData}>Refresh</button>


<p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Wallet Found: </span>{`${this.state.walletFound}`}</p>
<p><span style={{fontWeight: "bold"}}>Wallet Connected: </span>{`${this.state.walletIsEnabled}`}</p>
<p><span style={{fontWeight: "bold"}}>Wallet API version: </span>{this.state.walletAPIVersion}</p>
<p><span style={{fontWeight: "bold"}}>Wallet name: </span>{this.state.walletName}</p>

<p><span style={{fontWeight: "bold"}}>Network Id (0 = testnet; 1 = mainnet): </span>{this.state.networkId}</p>
<p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>UTXOs: (UTXO #txid = ADA amount + AssetAmount + policyId.AssetName + ...): </span>{this.state.Utxos?.map(x => <li style={{fontSize: "10px"}} key={`${x.str}${x.multiAssetStr}`}>{`${x.str}${x.multiAssetStr}`}</li>)}</p>
<p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Balance: </span>{this.state.balance}</p>
<p><span style={{fontWeight: "bold"}}>Change Address: </span>{this.state.changeAddress}</p>
<p><span style={{fontWeight: "bold"}}>Staking Address: </span>{this.state.rewardAddress}</p>
<p><span style={{fontWeight: "bold"}}>Used Address: </span>{this.state.usedAddress}</p>
<hr style={{marginTop: "40px", marginBottom: "40px"}}/>
</details>
{
    addressL &&
       profileList.filter(function(prd) {return addressL.includes(prd.address)}).map(prd => (
         <div className='sdw'>    
  
   <h2> <img className='logo' src={prd.image}/> <span>{prd.name}</span></h2> 
    
     <p>{prd.description}</p> 
 {// <p>{prd.location}</p> 
 }
</div> 
        ))
    }


<details> 
    <summary>Edit profile</summary> 
Institution: <input id="name" type="text"></input> <br></br>
Location:<input id="loc" type="text"></input> <br></br>
 Description: 
 <input id="description" type="text"></input> <br></br>
 Image (optional):  
 <input id="image" type="text"></input> <br></br>
 Website (optional):  
 <input id="website" type="text"></input> <br></br>
 <button class='button-30' style={{padding: "10px"}} onClick={this.updateProfile}>Update</button>
</details>


</div>
                    } />




                    
                    <Tabs.Expander />
                </Tabs>

                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>

                {/*<p>{`Unsigned txBodyCborHex: ${this.state.txBodyCborHex_unsigned}`}</p>*/}
                {/*<p>{`Signed txBodyCborHex: ${this.state.txBodyCborHex_signed}`}</p>*/}
                <p>{`Submitted Tx Hash: ${this.state.submittedTxHash}`}</p>
                <p>{this.state.submittedTxHash ? 'check your wallet !' : ''}</p>



            </div>
        )
    }
}



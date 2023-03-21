const { ethers } = require('hardhat');
const { expect } = require('chai');
const { parseEther } = require('@ethersproject/units');

describe("Testing multisigwallet contract", () => {

  let contractAbi;

  before(async() => {
    const accounts = await ethers.getSigners();
    const myContract = await ethers.getContractFactory("MultiSigWallet");
    contractAbi = await myContract.deploy([accounts[0].address,accounts[1].address, accounts[2].address], 1);
    await contractAbi.deployed();
    console.log("Contract deployed at: ", contractAbi.address);
  });

  it("Atleast one owner is required", async() => {
    expect(await contractAbi.getOwners()).to.have.length.of.at.least(1);
  });

  it("There must be atleast one required confirmation", async() => {
    expect(await contractAbi.numConfirmationsRequired()).to.greaterThanOrEqual(1);
  });

  it("Owners should not be duplicated", async () => {
    
    const findDuplicatesInArray = (arr) => {
      return new Set(arr).size !== arr.length
    }

    const solArr = await contractAbi.getOwners();
    const jsArr = Array.from(solArr);
    const duplicateFound = findDuplicatesInArray(jsArr);
    expect(duplicateFound).to.equal(false);
  });

  it("Owner should not be a zero address", async() => {
    expect(await contractAbi.getOwners()).to.not.include.members(["0x0000000000000000000000000000000000000000"]);
  });

  it("Submit transaction", async () => {
    
    // initiating variables
    const accounts = await ethers.getSigners();
    const addressTo = accounts[3].address;
    const value = 300;
    const data = "0xab";
    // creating connection
    const wallet = contractAbi.connect(accounts[0]);
    
    // setting initial parameter
    const noOfTransactionsBeforeExecution = await wallet.getTransactionCount();
    // executing function
    await wallet.submitTransaction(addressTo, value, data);
    // validating execution
    const noOfTransactionsAfterExecution = await wallet.getTransactionCount();
    expect(noOfTransactionsAfterExecution).is.equal(noOfTransactionsBeforeExecution + 1);
  });
  
  it("Transaction must be submitted before confirmation", async () => {
    const accounts = await ethers.getSigners();
    // index of transaction to be confirmed
    const txIndex = 0;
    const wallet = contractAbi.connect(accounts[0]);
    const transactionsCount = await wallet.getTransactionCount();
    expect(txIndex).lessThan(transactionsCount);
  });

  it("Only owner can confirm transaction", async() => {
    // const owners = await contractAbi.getOwners();
    const accounts = await ethers.getSigners();
    const wallet = contractAbi.connect(accounts[2]);
    expect(await wallet.confirmTransaction(0));
  });

  it("Transaction is confirmed", async () => {
    const indexOfTransactionToBeConfirmed = 0;
    const accounts = await ethers.getSigners();
    const msgSender = accounts[2];
    const wallet = await contractAbi.connect(msgSender);
    expect(await wallet.isConfirmed(indexOfTransactionToBeConfirmed,msgSender.address)).to.equal(true);
  });


  // Below test needs to be commented if we want to test the execution (last test) otherwise the confirmatin will be revoked and transaction will not be executed
  /*
  it("Confirmation is revoked", async () => {
    const indexOfTransactionToBeConfirmed = 0;
    const accounts = await ethers.getSigners();
    const msgSender = accounts[2];
    const wallet = await contractAbi.connect(msgSender);
    await wallet.revokeConfirmation(0)
    expect(await wallet.isConfirmed(indexOfTransactionToBeConfirmed,msgSender.address)).to.equal(false);
  });
  */

  it("Ethers are deposited", async () => {
    const value = parseEther("1");
    const options = {value: value}
    const accounts = await ethers.getSigners();
    const msgSender = accounts[4];
    const wallet = await contractAbi.connect(msgSender);
    await wallet.DepositETH(options);
    expect(await contractAbi.getBalance()).to.equal(value);
  });

  
  it("Transaction is executed successfully", async () => {
    const accounts = await ethers.getSigners();
    const msgSender = accounts[2];
    const wallet = await contractAbi.connect(msgSender);
    await wallet.executeTransaction(0);
    const transaction = await wallet.getTransaction(0);
    expect(transaction.executed).to.equal(true);
  });

});
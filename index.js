// nodejs, require()
// front-end javascript, import
import { ethers } from "./ethers.-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const donateButton = document.getElementById("donateButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
donateButton.onclick = donate;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

// console.log(ethers);  // check if ethers is imported

async function connect() {
  if (typeof window.ethereum != "undefined") {
    // check if window.ethereum exists to connect to the blockchain node
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" }); // metamask window will popup
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    connectButton.innerHTML = "Please install metamask";
  }
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance)); // formatEther make it easy to read
  }
}

// fund function
async function donate() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  // make sure it's connected to the blockchain
  if (typeof window.ethereum != "undefined") {
    // To send a transaction, we need:
    // 1. provider / connection to the blockchain
    // 2. singer / wallet / someone with some gas
    // 3. contract that we are interaction with: ABI and Address
    const provider = new ethers.providers.Web3Provider(window.ethereum); // connect our provider with metamask with the http url
    const signer = provider.getSigner(); // return the wallet connect to the provider, which is metamask, so it will be connected wallet on metamask
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.donate({
        value: ethers.utils.parseEther(ethAmount),
      });
      // hey, wait for this Tx to finish
      await listenForTxMined(txResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTxMined(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}...`);
  // create a listener for the blockchain
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      // once the txResponse.hash is found, we call the async function
      console.log(`Completed with ${txReceipt.confirmations} confirmations.`);
      resolve(); // the Promise will be returned once the resolve() or reject() is called. And only finish the function for just once.
    });
  });
}

// withdraw function
async function withdraw() {
  console.log(`Withdrawing the fund...`);
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const txResponse = await contract.withdraw();
    try {
      await listenForTxMined(txResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

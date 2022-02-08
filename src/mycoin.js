import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./MyCoin.json";
import "./mycoin.css";

export default function MyCoinPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({
    walletAddress: "",
    walletAddressToBurn: "",
    walletAddressToMint: "",
    transferAmount: "",
    burnAmount: "",
    mintAmount: "",
  });
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [error, setError] = useState(null);
  const contractAddress = "0xCc0Fb7801D0ac8Fd9a41917ae6fe5ADe6705a3Ac";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);

        setTokenName(`${tokenName} 🦊`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await tokenContract.transfer(
          inputValue.walletAddress,
          utils.parseEther(inputValue.transferAmount)
        );
        console.log("Transfering tokens...");
        await txn.wait();
        console.log("Tokens Transfered", txn.hash);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let tokenOwner = await tokenContract.owner();
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (tokenOwner.toLowerCase() !== account.toLowerCase()) {
          alert(
            "tokenOwner is " + tokenOwner + ", current account is " + account
          );
          return;
        }
        const txn = await tokenContract.burnFrom(
          inputValue.walletAddressToBurn,
          utils.parseEther(inputValue.burnAmount)
        );
        console.log("Burning tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let tokenOwner = await tokenContract.owner();
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (tokenOwner.toLowerCase() !== account.toLowerCase()) {
          alert("Only token owner can mint.");
          return;
        }
        const txn = await tokenContract.mint(
          inputValue.walletAddressToMint,
          utils.parseEther(inputValue.mintAmount)
        );
        console.log("Minting tokens...");
        const receipt = await txn.wait();
        tokenContract.on("additionalTokensMinted", (owner, amount, message) => {
          console.log({ owner: owner, amount: amount, message: message });
        });
        console.log("Tokens minted...", txn.hash);
        console.log(receipt.events);
        console.log(receipt.events[0]);
        console.log(receipt.events[1].args[0]);
        console.log(receipt.events[1].args.amount.toString());
        console.log(receipt.events[1].args.message);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfo();
  }, []);

  return (
    <main className="main-container mx-auto col-8">
      <h2 className="headline mt-5">
        <span className="headline-gradient">My Coin Management Page</span>
        <img
          className="inline p-3 ml-2"
          src="https://i.imgur.com/5JfHKHU.png"
          alt="Meme Coin"
          width="60"
          height="30"
        />
      </h2>
      <section className="customer-section px-10 pt-1 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5 ms-5">
          <span className="me-5">
            <strong>Coin:</strong> {tokenName}{" "}
          </span>
          <span className="me-5">
            <strong>Ticker:</strong> {tokenSymbol}{" "}
          </span>
          <span className="me-5">
            <strong>Total Supply:</strong> {tokenTotalSupply}
          </span>
        </div>
        <div className="mt-5 mb-9 ms-5">
          <form className="form-style">
            <input
              type="text"
              className="input-double col-6"
              onChange={handleInputChange}
              name="walletAddress"
              placeholder="Wallet Address"
              value={inputValue.walletAddress}
            />
            <input
              type="text"
              className="input-double col-2"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <button className="btn-purple" onClick={transferToken}>
              Transfer Tokens
            </button>
          </form>
        </div>
        {isTokenOwner && (
          <section className=" ms-5">
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-double col-6"
                  onChange={handleInputChange}
                  name="walletAddressToBurn"
                  placeholder="Wallet Address"
                  value={inputValue.walletAddressToBurn}
                />
                <input
                  type="text"
                  className="input-style col-2"
                  onChange={handleInputChange}
                  name="burnAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                />
                <button className="btn-purple" onClick={burnTokens}>
                  Burn Tokens
                </button>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-double col-6"
                  onChange={handleInputChange}
                  name="walletAddressToMint"
                  placeholder="Wallet Address"
                  value={inputValue.walletAddressToMint}
                />
                <input
                  type="text"
                  className="input-style col-2"
                  onChange={handleInputChange}
                  name="mintAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                />
                <button className="btn-purple" onClick={mintTokens}>
                  Mint Tokens
                </button>
              </form>
            </div>
          </section>
        )}
        <div className="col-8 ms-5">
          <div className="mt-5 ms-5">
            <p>
              <span className="font-bold">Contract Address: </span>
              {contractAddress}
            </p>
          </div>
          <div className="mt-5 ms-5">
            <p>
              <span className="font-bold">Token Owner Address: </span>
              {tokenOwnerAddress}
            </p>
          </div>
          <div className="mt-5 ms-5">
            {isWalletConnected && (
              <p>
                <span className="font-bold">Your Wallet Address: </span>
                {yourWalletAddress}
              </p>
            )}
            <button className="btn-connect" onClick={checkIfWalletIsConnected}>
              {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

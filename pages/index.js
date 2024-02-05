import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [lastReceipt, setLastReceipt] = useState(null); // Store the last receipt
  const [language, setLanguage] = useState(0); // 0: English, 1: Malayalam, 2: Hindi
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Translation mappings
  const translations = {
    userName: ["Harinath ", "ഹരിനാഥ് ഡോ", "हरिनाथ डो"],
    fatherName: ["Harinath ", "ഹരിനാഥ് ഡോ സർ", "हरिनाथ डो वरिष्ठ"],
    nomineeName1: ["Harinath", "അലിസ് ഡോ", "एलिस डो"],
    nomineeName2: ["Harinath", "ബോബ് ഡോ", "बॉब डो"],
    transactionType: ["Harinath", "നിർത്തിക്കുക", "जमा"],
  };

  // Function to generate receipt
  const generateReceipt = (transactionType, amount) => {
    const receipt = {
      userName: translations.userName[language],
      balance: balance,
      fatherName: translations.fatherName[language],
      nomineeName1: translations.nomineeName1[language],
      nomineeName2: translations.nomineeName2[language],
      transactionType: translations.transactionType[language],
      amount: amount,
    };
    setLastReceipt(receipt);
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount !== '') {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
      generateReceipt("Deposit", depositAmount); 
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount !== '') {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
      generateReceipt("Withdraw", withdrawAmount); 
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <label>
          Deposit Amount (ETH):
          <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
        </label>
        <button onClick={deposit}>Deposit</button>
        <br />
        <label>
          Withdraw Amount (ETH):
          <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
        </label>
        <button onClick={withdraw}>Withdraw</button>
        <br />
        <label>
          Select Language:
          <select value={language} onChange={(e) => setLanguage(parseInt(e.target.value))}>
            <option value={0}>English</option>
            <option value={1}>Malayalam</option>
            <option value={2}>Hindi</option>
          </select>
        </label>
        <button onClick={printLastReceipt}>Print Last Receipt</button> {/* Call the printLastReceipt function */}
      </div>
    );
  };

  // Function to print last receipt
  const printLastReceipt = () => {
    if (lastReceipt) {
      console.log("Printing Last Receipt:");
      console.log(lastReceipt);
      // Logic to display/print receipt
      // Depending on the selected language, you can render the receipt accordingly
      let receiptLanguage = "";
      switch (language) {
        case 1:
          receiptLanguage = "Malayalam";
          break;
        case 2:
          receiptLanguage = "Hindi";
          break;
        default:
          receiptLanguage = "English";
      }
      console.log(`Receipt Language: ${receiptLanguage}`);
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      {lastReceipt && (
        <div>
          <h2>digital Receipt</h2>
          <p>User Name: {lastReceipt.userName}</p>
          <p>Balance: {lastReceipt.balance}</p>
          <p>Father's Name: {lastReceipt.fatherName}</p>
          <p>Nominee Name 1: {lastReceipt.nomineeName1}</p>
          <p>Nominee Name 2: {lastReceipt.nomineeName2}</p>
          <p>Transaction Type: {lastReceipt.transactionType}</p>
          <p>Amount: {lastReceipt.amount}</p>
        </div>
      )}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}

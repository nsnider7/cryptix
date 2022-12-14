
const contractAddress = "0x432B49D2526Ac6Ab4eED9Af6FF3D26ec2BDB3b43";
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

let web3;
let contract;
let provider;
let selectedAccount;

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad';

async function main() {
    const mainButton = document.getElementById("mint");
    if (mainButton) {
        mainButton.addEventListener("click", async () => {
            if (mainButton.textContent === "Mint Here") {
                let result = await connectWallet()
                if (result) {
                    document.getElementById("quantity-selector").style.display = "block";

                    mainButton.textContent = "Mint"
                    
                    web3.eth.handleRevert = false;
                    contract = new web3.eth.Contract(JSON.parse(JSON.stringify(CONTRACT_ABI)), contractAddress);
                    getTotalSupply()
                    setTitle();
                    setInterval(getTotalSupply, 20000)
                }
            } else if (mainButton.textContent === "Mint") {
                setTitle();
                var quantity = document.getElementById('quantity').selectedOptions[0].value
                if (quantity === "1" || quantity === "2" || quantity === "3" || quantity === "4") {
                    document.getElementById("buttonString").textContent = ""; 
                    await mintNFT(parseInt(quantity))
                } else {
                    document.getElementById("buttonString").textContent = "Select a quantity from the dropdown"; 
                }
            }

        });
    }
}

async function testMint(quantity, valueToSend, currentGasPriceWei) {
    let transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: selectedAccount, // must match user's active address.
        // gasPrice: 10000000000000, // 10000000000000
        value: valueToSend, 
      };
    try {
        let testCall = await contract.methods.mint(quantity).call(transactionParameters)
        return ""

    } catch (err) {
        let splitString = err.message.split(":");
        let reason = splitString[1].split("{")[0]
        return reason
    }
}

async function mintNFT(quantity) {
    try {
        let amountMinted = await contract.methods.addressMinted(selectedAccount).call()
        let currentGasPriceWei = await web3.eth.getGasPrice()
        let mintPrice = await contract.methods.NFT_PRICE().call()
        const saleLive = await contract.methods.saleLive().call()

        let transactionParameters = {}
        let valueToSend = 0;
        if (amountMinted > 0) {
            valueToSend = mintPrice * quantity;
        } else if(amountMinted == 0) {
            valueToSend = mintPrice * (quantity - 1);
        }
      let testCall = await testMint(quantity, valueToSend, currentGasPriceWei);
      if (saleLive && testCall === "") {

        transactionParameters = {
          to: contractAddress, // Required except during contract publications.
          from: selectedAccount, // must match user's active address.
          gasPrice: currentGasPriceWei, // 10000000000000
          value: valueToSend, 
          data: contract.methods.mint(quantity).encodeABI(),
        };
        
        await web3.eth.sendTransaction(transactionParameters, async function(err, transactionHash) {
            if (err) { 
                document.getElementById("buttonString").textContent = "Minted failed"; 
            } else {
                document.getElementById("buttonString").textContent = "Minted succesfully"; 
            }
        })
      } else {
        document.getElementById("buttonString").textContent = testCall; 
      }


    } catch (error) {
        document.getElementById("buttonString").textContent = `Minting failed.`
      if (error && error.message) {
        console.log(error.message)
        if (error.message == "MetaMask Tx Signature: User denied transaction signature.") {
            document.getElementById("buttonString").textContent = `Transaction Rejected`
        } else {
            document.getElementById("buttonString").textContent = `Minting failed.`
        }
      } else {
        document.getElementById("buttonString").textContent = `Minting failed.`
      }
    }
  }

async function getTotalSupply() {
    const NFT_STOCK = parseInt(await contract.methods.NFT_STOCK().call())
    let totalSupply = parseInt(await contract.methods.totalSupply().call());
    document.getElementById("numMinted").textContent = `${totalSupply}/${NFT_STOCK} minted`
}

async function setTitle() {
    const saleLive = await contract.methods.saleLive().call()
    if (saleLive) {
        document.getElementById("saleLive").textContent = `Sale is LIVE`
        return
    } else {
        document.getElementById("saleLive").textContent = `Sale is NOT LIVE`
        return
    }
}

async function connectWallet() {
    try {
        if (window.ethereum) {
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider, // required
                options: {
                    infuraId: INFURA_ID, // required
                },
            },
            }
        let web3Modal = new Web3Modal({
            cacheProvider: false, 
            providerOptions, 
            disableInjectedProvider: false, 
        });
        provider = await web3Modal.connect()
        web3 = new Web3(provider)
        const accounts = await web3.eth.getAccounts();
        selectedAccount = accounts[0]
        document.getElementById("wallet").textContent = accounts[0] + ` ??????`
        return true
        
        } else{
        document.getElementById("wallet").textContent = "" + ` ???`
        return false
        }
    } catch(err) {
        console.log(err)
        document.getElementById("wallet").textContent = "Please connect your wallet" + ` ???`
        return false
    }
}

  main();
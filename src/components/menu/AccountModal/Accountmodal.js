/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { connect } from "react-redux";
import { accountUpdate, tokenUpdate } from "../../../redux/actions";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import detectEthereumProvider from "@metamask/detect-provider";
import WalletLink from "walletlink";
import COINBASE_ICON from "./../../../assets/react.svg";
import { Networks } from "./networks";
import {
  Login,
  Logout,
  Register,
  checkuseraddress,
} from "../../../apiServices";

// import "./Mode.css";

function initWeb3(provider) {
  const web3 = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });

  return web3;
}

const AccountModal = (props) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  let web3Modal = null;
  let web3 = null;
  let provider = null;

  // to initilize the web3Modal

  const init = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            80001: process.env.REACT_APP_RPC_URL,
          },
          network: process.env.REACT_APP_NETWORK,
          chainId: process.env.REACT_APP_CHAIN_ID,
          // infuraId: YOUR_INFURA_KEY,
        },
      },

      "custom-coinbase": {
        display: {
          logo: COINBASE_ICON,
          name: "Coinbase",
          description: "Scan with WalletLink to connect",
        },
        options: {
          appName: "app", // Your app name
          networkUrl: process.env.REACT_APP_RPC_URL,
          chainId: process.env.REACT_APP_CHAIN_ID,
        },
        package: WalletLink,
        connector: async (_, options) => {
          const { appName, networkUrl, chainId } = options;
          const walletLink = new WalletLink({
            appName,
          });
          const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
          await provider.enable();
          return provider;
        },
      },
    };

    web3Modal = new Web3Modal({
      network: process.env.REACT_APP_NETWORK,
      cacheProvider: true,
      providerOptions: providerOptions,
    });
    provider = await detectEthereumProvider();
  };

  init();

  useEffect(() => {
    async function update() {
      if (window.sessionStorage.getItem("selected_account") != null) {
        setCurrentAccount(window.sessionStorage.getItem("selected_account"));
        if (provider) {
          web3 = await initWeb3(provider);
          const chainId = await web3.eth.getChainId();
          let bal = await web3.eth.getBalance(
            window.sessionStorage.getItem("selected_account")
          );
          console.log("bal", bal);
          props.dispatch(
            accountUpdate({
              account: window.sessionStorage.getItem("selected_account"),
              chainId: chainId,
              balance: bal,
            })
          );
        }
      }
    }

    update();
  }, [window.sessionStorage.getItem("selected_Account"), web3, provider]);
  // action on connect wallet button

  const onConnect = async () => {
    //Detect Provider
    try {
      provider = await web3Modal.connect();
      if (provider.open) {
        await provider.open();
        web3 = initWeb3(provider);
      }
      window.sessionStorage.setItem("Provider", provider);
      if (!provider) {
        console.log("no provider found");
      } else {
        web3 = new Web3(provider);
        await ConnectWallet();
      }
      const chainId = await web3.eth.getChainId();

      if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
        setWrongNetwork(true);
        setIsPopup(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // connect wallet

  const ConnectWallet = async () => {
    if ("caches" in window) {
      caches.keys().then((names) => {
        // Delete all the cache files
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    try {
      const chainId = await web3.eth.getChainId();
      console.log(chainId);

      if (chainId.toString() !== "80001") {
        console.log("Wrong network");
        setWrongNetwork(true);
        setIsPopup(true);
        props.dispatch(
          accountUpdate({
            account: null,
            chainId: chainId,
            balance: null,
          })
        );
      } else {
        // Get list of accounts of the connected wallet
        setWrongNetwork(false);
        setIsPopup(false);
        const accounts = await web3.eth.getAccounts();

        // MetaMask does not give you all accounts, only the selected account
        window.sessionStorage.setItem("selected_account", accounts[0]);
        const chainId = await web3.eth.getChainId();
        let bal = await web3.eth.getBalance(accounts[0]);
        console.log("bal", bal);
        window.sessionStorage.setItem("balance", bal);
        props.dispatch(
          accountUpdate({
            account: accounts[0],
            chainId: chainId,
            balance: bal,
          })
        );
        setCurrentAccount(accounts[0]);

        let response1 = await checkuseraddress(
          window.sessionStorage.getItem("selected_account")
        );
        console.log(response1);
        // let response = "User Not found";

        if (response1.message === "User Not Found") {
          try {
            await Register(window.sessionStorage.getItem("selected_account"));
            console.log("User Registered Successfully");
            // setTimeout(() => (window.location.href = "/profile"), 2000);
          } catch (e) {
            console.log("Failed to Register");
            return;
          }
          try {
            let token = await Login(
              window.sessionStorage.getItem("selected_account")
            );
            console.log(token);
            props.dispatch(
              tokenUpdate({
                token: token,
              })
            );
            console.log("Logged In Successfully");

            // setTimeout(() => (window.location.href = "/profile"), 2000);
          } catch (e) {
            console.log("Failed to Login");
            return;
          }
        } else {
          try {
            let token = await Login(
              window.sessionStorage.getItem("selected_account")
            );
            console.log(token);
            props.dispatch(
              tokenUpdate({
                token: token,
              })
            );
            console.log("Logged In Successfully");
            // setTimeout(() => (window.location.href = "/profile"), 2000);
            // window.location.href = "/profile";
          } catch (e) {
            console.log("Failed to Login");
            return;
          }
        }
      }
    } catch (error) {
      if (error.message) {
        console.log("error", error.message);
      }
    }
  };

  //  disconnect wallet

  const onDisconnect = useCallback(async () => {
    if (!web3) {
      window.sessionStorage.removeItem("selected_account");
    }
    if (web3) {
      const chainId = await web3.eth.getChainId();
      props.dispatch(
        accountUpdate({
          account: null,
          chainId: chainId,
          balance: null,
        })
      );
    }
    window.sessionStorage.removeItem("selected_account");
    window.sessionStorage.removeItem("Provider");
    window.sessionStorage.removeItem("balance");
    await setCurrentAccount(null);
    await web3Modal.clearCachedProvider();
    web3Modal = null;
    await Logout();
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.disconnect();
    }
    if ("caches" in window) {
      caches.keys().then((names) => {
        // Delete all the cache files
        names.forEach((name) => {
          caches.delete(name);
        });
      });

      if (!wrongNetwork) window.location.reload(true);
    }
  }, [currentAccount]);

  useEffect(() => {
    if (provider) {
      provider.on("chainChanged", async (_chainId) => {
        const chainId = parseInt(_chainId, 16);
        console.log(process.env.REACT_APP_CHAIN_ID);
        console.log(chainId);

        if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
          setWrongNetwork(true);
          setIsPopup(true);
          props.dispatch(
            accountUpdate({
              account: null,
              chainId: chainId,
              balance: null,
            })
          );

          props.dispatch(
            tokenUpdate({
              token: null,
            })
          );
          onDisconnect();
        } else {
          console.log("accountt", currentAccount);
          setWrongNetwork(false);
          setIsPopup(false);
          web3 = initWeb3(provider);
          let bal = await web3.eth.getBalance(currentAccount);
          console.log("bal", bal);
          window.sessionStorage.setItem("balance", bal);
          console.log("accounttt", currentAccount);
          props.dispatch(
            accountUpdate({
              account: currentAccount,
              chainId: chainId,
              balance: bal,
            })
          );
        }
      });
    }
  }, [onDisconnect, currentAccount, props, provider]);

  // function to detect account change

  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", async function (accounts) {
        const id = await provider.request({ method: "eth_chainId" });
        const chainId = parseInt(id, 16);
        if (
          chainId.toString() === process.env.REACT_APP_CHAIN_ID &&
          currentAccount
        ) {
          console.log("accountt", accounts[0]);
          setCurrentAccount(accounts[0]);
          window.sessionStorage.removeItem("selected_account");
          window.sessionStorage.setItem("selected_account", accounts[0]);
          web3 = initWeb3(provider);
          let bal = await web3.eth.getBalance(accounts[0]);
          console.log("bal", bal);
          window.sessionStorage.setItem("balance", bal);
          props.dispatch(
            accountUpdate({
              account: accounts[0],
              chainId: chainId,
              balance: bal,
            })
          );
          let response = await checkuseraddress(
            window.sessionStorage.getItem("selected_account")
          );
          if (response === "User not found") {
            try {
              await Register(
                window.sessionStorage.getItem("selected_account", accounts[0])
              );
              // setTimeout(() => (window.location.href = "/profile"), 2000);
              console.log("New Wallet Registered Successfully");
            } catch (e) {
              console.log("Failed to Register");
              return;
            }
            try {
              let token = await Login(
                window.sessionStorage.getItem("selected_account")
              );
              props.dispatch(
                tokenUpdate({
                  token: token,
                })
              );
              console.log("Logged In Successfully");
              // setTimeout(() => (window.location.href = "/profile"), 2000);
              // window.location.href = "/profile";
            } catch (e) {
              console.log("Failed to Login");
              return;
            }
          } else {
            try {
              let token = await Login(
                window.sessionStorage.getItem("selected_account")
              );
              props.dispatch(
                tokenUpdate({
                  token: token,
                })
              );
              console.log("Logged In Successfully");
              // setTimeout(() => (window.location.href = "/profile"), 2000);
              // window.location.href = "/profile";
            } catch (e) {
              console.log("Failed to Login");
              return;
            }
          }
        } else if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
          setWrongNetwork(true);
          setIsPopup(true);

          props.dispatch(
            accountUpdate({
              account: null,
              chainId: chainId,
              balance: null,
            })
          );
          window.sessionStorage.removeItem("selected_account");
          setCurrentAccount(null);
          await onDisconnect();
        }
        window.location.reload();
      });
    }
  }, [currentAccount, provider]);

  // function to detect network change

  useEffect(() => {
    async function updateAccount() {
      if (provider) {
        const id = await provider.request({ method: "eth_chainId" });
        window.sessionStorage.setItem("selected_account", currentAccount);

        const chainId = parseInt(id, 16);
        web3 = initWeb3(provider);
        let bal = await web3.eth.getBalance(currentAccount);
        console.log("bal", bal);
        window.sessionStorage.setItem("balance", currentAccount);
        console.log("accounttt", currentAccount);
        props.dispatch(
          accountUpdate({
            account: currentAccount,
            chainId: chainId,
            balance: bal,
          })
        );
      }
    }
    if (currentAccount) {
      updateAccount();
    }
  }, [currentAccount, provider]);

  const changeNetwork = async ({ networkName }) => {
    try {
      console.log("networkName", networkName);
      if (!window.ethereum) throw new Error("No crypto wallet found");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...Networks[networkName],
          },
        ],
      });
    } catch (err) {
      // setError(err.message);
    }
  };

  const handleNetworkSwitch = async (networkName) => {
    await changeNetwork({ networkName });
    onConnect();
  };

  const togglePopup = () => {
    setIsPopup(!isPopup);
  };

  return (
    <>
      <button
        className="btn-main"
        style={{ color: props.color }}
        onClick={currentAccount ? onDisconnect : onConnect}
      >
        {window.sessionStorage.getItem("selected_account") &&
        window.sessionStorage.getItem("selected_account") !== "undefined"
          ? window.sessionStorage.getItem("selected_account").slice(0, 5) +
            "..." +
            window.sessionStorage.getItem("selected_account").slice(37, 42)
          : "Connect Wallet"}
      </button>
      {/* {wrongNetwork ? (
        <>
          {isPopup && (
            <PopupModal
              content={
                <div className="popup-content">
                  <h2>WRONG NETWORK</h2>
                  <p>Please switch to {process.env.REACT_APP_NETWORK}</p>
                  <button
                    className="btn-main content-btn"
                    style={{ color: props.color }}
                    onClick={() =>
                      handleNetworkSwitch(process.env.REACT_APP_NETWORK)
                    }
                  >
                    Switch Network
                  </button>
                </div>
              }
              handleClose={togglePopup}
            />
          )}
        </>
      ) : null} */}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    profileData: state.profileData,
  };
};

export default connect(mapStateToProps)(AccountModal);

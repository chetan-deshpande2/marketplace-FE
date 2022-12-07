/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { connect } from 'react-redux';
import { accountUpdate, tokenUpdate } from '../../../redux/actions';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import detectEthereumProvider from '@metamask/detect-provider';
import WalletLink from 'walletlink';
import COINBASE_ICON from './../../../assets/react.svg';
import { Networks } from './networks';
import { Login, Logout, Register, checkuseraddress } from '../../../apiServices';
import PopupModal from './popupModal';
import { useCookies } from 'react-cookie';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { BsExclamationLg } from 'react-icons/bs';
// import "./Mode.css";

async function initWeb3(provider) {
  const web3 = new Web3(provider);

  await web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
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
  const [cookies, setCookie, removeCookie] = useCookies([]);

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
        },
      },
    };

    web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: false,
      providerOptions: providerOptions,
    });

    provider = await detectEthereumProvider();
    web3 = await initWeb3(provider);
    if (web3 && provider) {
      if (web3.eth) {
        provider.on('accountsChanged', async function (accounts) {
          let acc = await web3?.eth?.getAccounts();

          removeCookie('selected_account', { path: '/' });
          removeCookie('balance', { path: '/' });
          removeCookie('Authorization', { path: '/' });

          setCurrentAccount(null);
          setInterval(() => {
            window.location.reload();
          }, 500);
        });

        provider.on('chainChanged', async (_chainId) => {
          console.log(
            '333',
            parseInt(_chainId, 16).toString() !== process.env.REACT_APP_CHAIN_ID,
            parseInt(_chainId, 16).toString(),
            process.env.REACT_APP_CHAIN_ID,
          );

          window.sessionStorage.setItem('chain_id', parseInt(_chainId, 16).toString());
          // if (_chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
          //   setWrongNetwork(true);
          //   setIsPopup(true);
          // } else {
          //   setWrongNetwork(false);
          //   setIsPopup(false);
          // }
        });
      }
    }
  };

  init();

  useEffect(() => {
    window.addEventListener('load', async () => {
      console.log('metamask detect', window.ethereum);
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          window.ethereum
            .request({ method: 'eth_requestAccounts' })
            .then((acc) => {})
            .catch((error) => {
              if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('Please connect to MetaMask.');
              } else {
                console.error(error);
              }
            });
          // Acccounts now exposed
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        // Acccounts always exposed
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    });
  }, []);

  useEffect(() => {
    async function update() {
      if (cookies.selected_account !== null) {
        setCurrentAccount(cookies.selected_account);

        if (provider) {
          web3 = await initWeb3(provider);
          let bal = await web3.eth.getBalance(cookies.selected_account);

          setCookie('balance', bal);
        }
      }
    }

    update();
  }, [cookies.selected_account, web3, provider]);

  const onConnect = async () => {
    //Detect Provider
    try {
      provider = await web3Modal.connect();
      if (provider.open) {
        await provider.open();
        web3 = initWeb3(provider);
      }
      if (!provider) {
        console.log('no provider found');
      } else {
        web3 = new Web3(provider);
        await ConnectWallet();
      }
      const chainId = await web3.eth.getChainId();
      console.log(chainId.toString(), '80001');
      window.sessionStorage.setItem('chain_id', chainId.toString());
      console.log('111', chainId.toString() !== '80001');
      // if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
      //   setWrongNetwork(true);
      //   setIsPopup(true);
      // } else {
      //   setWrongNetwork(false);
      //   setIsPopup(false);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  // connect wallet

  const ConnectWallet = async () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        // Delete all the cache files
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    try {
      const chainId = await web3.eth.getChainId();
      console.log('chain id', chainId);
      console.log('222', chainId.toString() !== '80001');
      window.sessionStorage.setItem('chain_id', chainId.toString());
      // if (chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
      //   console.log("Wrong network");
      // setWrongNetwork(true);
      // setIsPopup(true);
      // } else {
      // Get list of accounts of the connected wallet
      // setWrongNetwork(false);
      // setIsPopup(false);
      if (web3 && web3.eth) {
        const accounts = await web3.eth.getAccounts();

        setCookie('selected_account', accounts[0], { path: '/' });
        let bal = await web3.eth.getBalance(accounts[0]);

        setCookie('balance', bal, { path: '/' });

        setCurrentAccount(accounts[0]);
        let response = await checkuseraddress(accounts[0]);
        console.log(response.message);
        if (response.message === 'User Not Found') {
          try {
            console.log('inside register');
            await Register(accounts[0]);
            NotificationManager.success('User Registered Successfully', '', 800);
          } catch (e) {
            NotificationManager.error('Failed to Register', '', 800);
            return;
          }
          try {
            console.log('inside Login');
            console.log('cookies.selected_account', accounts[0]);
            let token = await Login(accounts[0]);
            setCookie('Authorization', token);
          } catch (e) {
            NotificationManager.error('Failed to Login', '', 800);
            return;
          }
        } else {
          try {
            let token = await Login(accounts[0]);
            setCookie('Authorization', token);

            NotificationManager.success('Logged In Successfully', '', 800);
          } catch (e) {
            NotificationManager.error('Failed to Login', '', 800);
            return;
          }
        }
        // }
      }
    } catch (error) {
      if (error.message) {
        console.log('error', error.message);
      }
    }
  };

  //  disconnect wallet

  const onDisconnect = useCallback(async () => {
    if (!web3) {
      removeCookie('selected_account', { path: '/' });
      removeCookie('balance', { path: '/' });
      removeCookie('Authorization', { path: '/' });
    }

    removeCookie('balance', { path: '/' });
    removeCookie('selected_account', { path: '/' });
    removeCookie('Authorization', { path: '/' });
    setCurrentAccount(null);
    await web3Modal.clearCachedProvider();
    web3Modal = null;
    await Logout();
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.disconnect();
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        // Delete all the cache files
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    window.location.reload(true);
  }, []);

  useEffect(() => {
    if (provider) {
      provider.on('chainChanged', async (_chainId) => {
        console.log(
          '444',
          parseInt(_chainId, 16).toString() !== process.env.REACT_APP_CHAIN_ID,
          parseInt(_chainId, 16).toString(),
          process.env.REACT_APP_CHAIN_ID,
        );
        window.sessionStorage.setItem('chain_id', parseInt(_chainId, 16).toString());
        // if (_chainId.toString() !== process.env.REACT_APP_CHAIN_ID) {
        //   setWrongNetwork(true);
        //   setIsPopup(true);
        // } else {
        //   setWrongNetwork(false);
        //   setIsPopup(false);
        // }
      });
    }
  }, [currentAccount, props, provider]);

  useEffect(() => {
    async function updateAccount() {
      if (provider) {
        setCookie('selected_account', currentAccount, { path: '/' });

        web3 = initWeb3(provider);
        if (web3 && web3.eth) {
          let bal = await web3?.eth?.getBalance(currentAccount);
          setCookie('balance', bal);
        }
      }
    }
    if (currentAccount) {
      updateAccount();
    }
  }, [currentAccount, provider]);

  useEffect(() => {
    if (provider) {
      provider.on('disconnect', (error) => {
        console.log(error);
      });
    }
  }, [provider]);

  const changeNetwork = async ({ networkName }) => {
    try {
      console.log('networkName', networkName);
      if (!window.ethereum) throw new Error('No crypto wallet found');
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            ...Networks[networkName],
          },
        ],
      });
    } catch (err) {
      console.log('error in network switch', err);
    }
  };

  const handleNetworkSwitch = async (networkName) => {
    // setIsPopup(false);
    // setWrongNetwork(false);
    try {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: Networks[networkName].chainId }],
        });
        // setIsPopup(false);
        // setWrongNetwork(false);
        NotificationManager.success('Chain switched successfully');
      } catch (e) {
        if (e.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{ ...Networks[networkName] }],
            });
          } catch (addError) {
            console.error(addError);
            NotificationManager.success('Something went wrong');
          }
        } else {
          NotificationManager.success('Something went wrong');
        }
        // console.error(e)
      }

      // let res = await changeNetwork({ networkName });
      // console.log("resss", res);
    } catch (e) {
      console.log('error in switch', e);
    }
    // onConnect();
  };

  const togglePopup = () => {
    setIsPopup(!isPopup);
  };

  useEffect(() => {
    setCurrentAccount(cookies.selected_account);
  }, [cookies.selected_account]);

  return (
    <>
      <button
        className="btn-main"
        style={{ color: props.color }}
        onClick={
          // localStorage.getItem("selected_account")
          currentAccount ? onDisconnect : onConnect
        }
      >
        {currentAccount ? currentAccount.slice(0, 5) + '...' + currentAccount.slice(37, 42) : 'Connect Wallet'}
      </button>
      {wrongNetwork ? (
        <>
          {isPopup && (
            <PopupModal
              content={
                <div className="popup-content">
                  <BsExclamationLg className="BsExclamationLg" />
                  <h2>WRONG NETWORK</h2>
                  <p>Please switch to {process.env.REACT_APP_NETWORK}</p>
                  <button
                    className="btn-main content-btn"
                    style={{ color: props.color }}
                    onClick={() => handleNetworkSwitch(process.env.REACT_APP_NETWORK)}
                  >
                    Switch Network
                  </button>
                </div>
              }
              handleClose={togglePopup}
            />
          )}
        </>
      ) : null}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    token: state.token,
    profileData: state.profileData,
  };
};

export default connect(mapStateToProps)(AccountModal);

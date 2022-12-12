import React, { useCallback, useEffect, useState } from 'react';
import Clock from '../components/Clock';
import Footer from '../components/footer';
import { ethers } from 'ethers';
import { createGlobalStyle } from 'styled-components';
import {
  fetchBidNft,
  GetHistory,
  GetIndividualAuthorDetail,
  GetNftDetails,
  GetOrdersByNftId,
  LikeNft,
  InsertHistory,
  getProfile,
} from '../../apiServices';
import Loader from '../components/loader';
import {
  createBid,
  handleAcceptBids,
  handleBuyNft,
  handleNftTransfer,
  handleRemoveFromAuction,
  handleUpdateBidStatus,
} from '../../helpers/sendFunctions';
import { convertToEth } from '../../helpers/numberFormatter';
import { handleRemoveFromSale } from '../../helpers/sendFunctions';
import PopupModal from '../menu/AccountModal/popupModal';
import { putOnMarketplace } from '../../helpers/sendFunctions';
import './../../assets/images/avatar5.jpg';
import { NotificationManager } from 'react-notifications';
import { CURRENCY, GENERAL_DATE, GENERAL_TIMESTAMP, ZERO_ADDRESS } from '../../helpers/constants';
import BigNumber from 'bignumber.js';
import {
  // checkIfLiked,
  getAllBidsByNftId,
  getPaymentTokenInfo,
} from '../../helpers/getterFunctions';
import { isEmpty } from '../../helpers/getterFunctions';
import '../component-css/item-details.css';
import { options } from '../../helpers/constants';
import { useParams } from '@reach/router';
import Avatar from './../../assets/images/avatar5.jpg';
import {
  checkIfValidAddress,
  getMaxAllowedDate,
  getTokenSymbolByAddress,
  handleNetworkSwitch,
} from './../../helpers/utils';
import { useCookies } from 'react-cookie';
import contracts from '../../Config/contracts';
import { perPageCount } from './../../helpers/constants';
// import { Pagination } from '@material-ui/lab';
import ConnectWallet from '../menu/AccountModal/ConnectWallet';
import { showProcessingModal } from '../../utils';
import PolygonLogo from '../../assets/react.svg';

import { isEmptyObject } from 'jquery';
// import CheckoutModal from "../components/Modals/CheckoutModal";
import moment from 'moment';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #403f83;
    border-bottom: solid 1px #dddddd;
  }                      <span>{authorDetails ? authorDetails.sUserName : nftDetails.nCollection}</span>
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: #fff;
  }


  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
      color: #fff;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const ItemDetails = function (props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openMenu1, setOpenMenu1] = useState(true);
  const [openMenu2, setOpenMenu2] = useState(false);
  const [openMenu3, setOpenMenu3] = useState(false);

  // LOADERS
  const [loading, setLoading] = useState(false);
  const [placeBidLoader, setPlaceBidLoader] = useState(false);
  const [transferLoader, setTransferLoader] = useState(false);
  const [removeFromSaleLoader, setRemoveFromSaleLoader] = useState(false);
  const [buyLoader, setBuyLoader] = useState(false);
  const [putOnMarketplaceLoader, setPutOnMarketplaceLoader] = useState(false);

  const [orderState, setOrderState] = useState([]);

  const [nftDetails, setNftDetails] = useState({});
  const [authorDetails, setAuthorDetails] = useState({});
  const [orders, setOrders] = useState('null');
  const [isPopup, setIsPopup] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [isMarketplacePopup, setMarketplacePopup] = useState(false);
  const [marketplacePrice, setMarketplacePrice] = useState('');
  const [marketplaceSaleType, setMarketplaceSaleType] = useState(0);
  const [isOwned, setIsOwned] = useState(false);
  const [marketplaceQuantity, setMarketplaceQuantity] = useState(1);
  const [haveOrder, setHaveOrder] = useState('null');
  const [ownedQuantity, setOwnedQuantity] = useState();
  const [minimumBid, setMinimumBid] = useState('');
  const [endTime, setEndTime] = useState();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState(contracts.USDT);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(options[0].title);
  const [beneficiary, setBeneficiary] = useState('');
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [isTransferPopup, setIsTransferPopup] = useState(false);
  const [isPlaceABidPopup, setIsPlaceABidPopup] = useState(false);
  const [selectedOrderPaymentTokenData, setSelectedOrderPaymentTokenData] = useState();
  const [bidQty, setBidQty] = useState(1);
  const [bidPrice, setBidPrice] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState();
  const [currentOrderSeller, setCurrentOrderSeller] = useState();
  const [bids, setBids] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [currentBuyPrice, setCurrentBuyPrice] = useState(0);
  const [currOrderLeftQty, setCurrOrderLeftQty] = useState(0);
  const [currentOrderMinBid, setCurrentOrderMinBid] = useState(0);
  const [metaData, setMetaData] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeEvent, setLikeEvent] = useState(false);
  const [profile, setProfile] = useState();
  const [cookies, setCookie] = useCookies(['selected_account', 'Authorization']);
  const [currOrderType, setCurrOrderType] = useState();
  const [currPage, setCurrPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [userBalance, setUserBalance] = useState(0.0);
  const [willPay, setWillPay] = useState(0.0);
  const [checkoutLoader, setCheckoutLoader] = useState(false);

  const [connectedUserOrderId, setConnectedUserOrderId] = useState();
  const [highestBid, setHighestBid] = useState();
  const [showNotConnectedModal, setNotConnectedModal] = useState(false);

  const [isTimedAuction, setIsTimedAuction] = useState(false);

  const placeBidCal = [
    {
      key: 'Balance',
      value: userBalance,
    },
    {
      key: 'You will pay',
      value: willPay,
    },
  ];

  let { id } = useParams();

  const handleBtnClick = () => {
    setOpenMenu(true);
    setOpenMenu1(false);
    setOpenMenu2(false);
    setOpenMenu3(false);
    document.getElementById('Mainbtn').classList.add('active');
    document.getElementById('Mainbtn1').classList.remove('active');
    document.getElementById('Mainbtn2').classList.remove('active');
    document.getElementById('Mainbtn3').classList.remove('active');
  };

  const handleBtnClick1 = () => {
    setOpenMenu1(true);
    setOpenMenu(false);
    setOpenMenu2(false);
    setOpenMenu3(false);
    document.getElementById('Mainbtn1').classList.add('active');
    document.getElementById('Mainbtn').classList.remove('active');
    document.getElementById('Mainbtn2').classList.remove('active');
    document.getElementById('Mainbtn3').classList.remove('active');
  };

  const handleBtnClick2 = () => {
    setOpenMenu1(false);
    setOpenMenu(false);
    setOpenMenu2(true);
    setOpenMenu3(false);
    document.getElementById('Mainbtn1').classList.remove('active');
    document.getElementById('Mainbtn').classList.remove('active');
    document.getElementById('Mainbtn2').classList.add('active');
    document.getElementById('Mainbtn3').classList.remove('active');
  };

  const handleBtnClick3 = () => {
    setOpenMenu1(false);
    setOpenMenu(false);
    setOpenMenu2(false);
    setOpenMenu3(true);
    document.getElementById('Mainbtn1').classList.remove('active');
    document.getElementById('Mainbtn').classList.remove('active');
    document.getElementById('Mainbtn2').classList.remove('active');
    document.getElementById('Mainbtn3').classList.add('active');
  };

  const toggleMarketplace = () => {
    setMarketplacePopup(!isMarketplacePopup);
  };

  const handleMpShow = () => {
    setIsTimedAuction(false);
    document.getElementById('tab_opt_1').classList.add('show');
    document.getElementById('tab_opt_1').classList.remove('hide');
    document.getElementById('tab_opt_2').classList.add('hide');
    document.getElementById('tab_opt_2').classList.remove('show');
    document.getElementById('tab_opt_3').classList.add('hide');
    document.getElementById('tab_opt_3').classList.remove('show');
    document.getElementById('btn1').classList.add('active');
    document.getElementById('btn2').classList.remove('active');
    document.getElementById('btn3').classList.remove('active');
    setMarketplaceSaleType(0);
  };

  const handleMpShow1 = () => {
    setIsTimedAuction(true);
    document.getElementById('tab_opt_1').classList.add('hide');
    document.getElementById('tab_opt_1').classList.remove('show');
    document.getElementById('tab_opt_2').classList.remove('hide');
    document.getElementById('tab_opt_2').classList.add('show');
    document.getElementById('tab_opt_3').classList.add('hide');
    document.getElementById('tab_opt_3').classList.remove('show');
    document.getElementById('btn1').classList.remove('active');
    document.getElementById('btn2').classList.add('active');
    document.getElementById('btn3').classList.remove('active');
    setMarketplaceSaleType(1);
  };

  const handleMpShow2 = () => {
    setIsTimedAuction(false);
    document.getElementById('tab_opt_1').classList.add('hide');
    document.getElementById('tab_opt_1').classList.remove('show');
    document.getElementById('tab_opt_2').classList.add('hide');
    document.getElementById('tab_opt_2').classList.remove('show');
    document.getElementById('tab_opt_3').classList.remove('hide');
    document.getElementById('tab_opt_3').classList.add('show');
    document.getElementById('btn1').classList.remove('active');
    document.getElementById('btn2').classList.remove('active');
    document.getElementById('btn3').classList.add('active');
    setMarketplaceSaleType(2);
  };

  const onAuctionEnd = (index) => {
    let _orderState = orderState;
    _orderState[index] = true;
    setOrderState(_orderState);
  };

  function inputPrice(event) {
    const re = /[+-]?[0-9]+\.?[0-9]*/;
    let val = event.target.value;
    if (event.target.value === '' || re.test(event.target.value)) {
      const numStr = String(val);
      if (numStr.includes('.')) {
        if (numStr.split('.')[1].length > 8) {
        } else {
          if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, '');
          }
          if (val.length === 2 && val !== '0.') {
            val = Number(val);
          }
          setMarketplacePrice(val);
        }
      } else {
        if (val.split('.').length > 2) {
          val = val.replace(/\.+$/, '');
        }
        if (val.length === 2 && val !== '0.') {
          val = Number(val);
        }
        setMarketplacePrice(val);
      }
    }
  }

  function inputPriceAuction(event) {
    const re = /[+-]?[0-9]+\.?[0-9]*/;
    let val = event.target.value;
    if (event.target.value === '' || re.test(event.target.value)) {
      const numStr = String(val);
      if (numStr.includes('.')) {
        if (numStr.split('.')[1].length > 8) {
        } else {
          if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, '');
          }
          if (val.length === 2 && val !== '0.') {
            val = Number(val);
          }
          setMinimumBid(val);
        }
      } else {
        if (val.split('.').length > 2) {
          val = val.replace(/\.+$/, '');
        }
        if (val.length === 2 && val !== '0.') {
          val = Number(val);
        }
        setMinimumBid(val);
      }
    }
  }

  const handleChange = (e, p) => {
    setCurrPage(p);
  };

  useEffect(() => {
    console.log(cookies.selected_account);
    setCurrentUser(cookies.selected_account);
    setNotConnectedModal(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.selected_account]);

  const fetchUserProfile = useCallback(async () => {
    if (currentUser) {
      let _profile = await getProfile();

      setProfile(_profile);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, currentUser]);

  useEffect(
    () => {
      async function fetch() {
        setLoading(true);
        if (id) {
          let data = await GetNftDetails(id);
          let authorData = [];
          console.log(data?.nCreater?._id);
          if (data && data.nCreater) {
            authorData = await GetIndividualAuthorDetail({
              userId: data?.nCreater?._id,
              currUserId: profile ? profile.user._id : '',
            });
            console.log(authorData);
          }

          let is_user_like = profile
            ? data.nUser_likes.filter((d) => {
                return d === profile?._id;
              }).length > 0
            : false;
          console.log(data.nOwnedBy, currentUser);

          if (data && data.nOwnedBy && currentUser) {
            // eslint-disable-next-line array-callback-return
            let datas = data.nOwnedBy.filter((d, key) => {
              if (d.address) {
                return d?.address?.toLowerCase() === currentUser?.toLowerCase();
              }
            });
            console.log(datas.length);
            if (datas.length >= 1) {
              setIsOwned(true);
              console.log(datas[0].quantity);
              setOwnedQuantity(datas[0].quantity);
            }
          }

          let searchParams = {
            nftId: data._id,
            // sortKey: 'oTokenId',
            sortType: -1,
            page: 1,
            limit: 4,
          };

          let d = await GetOrdersByNftId(searchParams);
          console.log(d?.length);

          if (d?.length === 0) {
            setOrders([]);
            setHaveOrder(false);
          } else {
            let _orderState = [];
            for (let i = 0; i < d?.length; i++) {
              console.log(_orderState[i]);
              _orderState[i] = false;

              let searchParams = {
                nNFTId: data._id,
                orderID: d[i]._id,
                buyerID: 'All',
                bidStatus: 'All',
              };

              let _data = await fetchBidNft(searchParams);
              console.log(_data);
              if (data && currentUser) {
                if (d[i].oPaymentToken !== ZERO_ADDRESS) {
                  let paymentData = await getPaymentTokenInfo(currentUser, d.results[i].oPaymentToken);

                  if (currOrderType !== 0) {
                    setUserBalance(Number(convertToEth(paymentData?.balance)).toFixed(4));
                  }
                  paymentData.paymentToken = d.results[i].oPaymentToken;

                  d[i].paymentTokenData = paymentData;
                } else {
                  if (currOrderType === 0) {
                    setUserBalance(Number(convertToEth(cookies.balance ? cookies.balance : 0)).toFixed(4));
                  }
                }

                for (let j = 0; j < _data.data?.length; j++) {
                  if (_data.data[j]?.oBidder?.sWalletAddress?.toLowerCase() === currentUser?.toLowerCase()) {
                    d[i].isUserHaveActiveBid = true;
                    break;
                  } else {
                    d[i].isUserHaveActiveBid = false;
                  }
                }
              } else {
                let paymentData = await getPaymentTokenInfo('', d[i].oPaymentToken);
                paymentData.paymentToken = d[i].oPaymentToken;
                d[i].paymentTokenData = paymentData;
                console.log(d[i].paymentTokenData);
              }
            }
            console.log(_orderState);
            setOrderState(_orderState);
            console.log(d);
            let _orders = d;
            console.log(_orders.length, _orders[0], currentUser);
            if (_orders.length >= 1 && !isEmpty(_orders[0]) && currentUser) {
              let datas = _orders.filter((data, key) => {
                return data.oSellerWalletAddress?.toLowerCase() === currentUser?.toLowerCase();
              });
              if (datas.length >= 1) {
                setConnectedUserOrderId(datas[0]._id);
                setHaveOrder(true);
              } else {
                setHaveOrder(false);
              }
            }

            setOrders(d.results ? d.results : []);
          }

          setIsLiked(is_user_like);
          setTotalLikes(data?.nUser_likes?.length);
          setNftDetails(data);
          console.log(data);
          console.log(authorData);
          setAuthorDetails(authorData);
          if (isEmpty(data)) {
            window.location.href = '/profile';
          }
        }
        setLoading(false);
      }
      fetch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, id, currentUser, currOrderType],
  );

  useEffect(() => {
    console.log(nftDetails);
    const fetch = async () => {
      setLoading(true);

      if (nftDetails && nftDetails._id) {
        let history = await GetHistory({
          nftId: nftDetails._id,
          userId: 'All',
          action: 'All',
          actionMeta: 'All',
          page: currPage,
          limit: perPageCount,
        });
        console.log(history.count);
        setHistory(history.results[0]);
        setTotalPages(Math.ceil(history.count / perPageCount));
      }
      setLoading(false);
    };
    fetch();
  }, [nftDetails, currPage]);

  useEffect(() => {
    setTimeout(() => {
      console.log(isOwned);
    });
  });

  // useEffect(() => {
  //   console.log(nftDetails);
  //   const fetchData = async () => {
  //     if (nftDetails && nftDetails.nHash) {
  //       let resp = await fetch(process.env.REACT_APP_IPFS_URL + nftDetails.nHash);
  //       resp = await resp.json();

  //       setMetaData(eval(resp.attributes));
  //     }
  //   };

  //   fetchData();
  // }, [nftDetails]);

  // useEffect(() => {
  //   const checkIfOpenForSale = async () => {
  //     for (let i = 0; i < orders.length; i++) {
  //       console.log(orders[i]);
  //       if (orders[i].oStatus >= 1) {
  //         return;
  //       }
  //     }
  //     return;
  //   };

  //   checkIfOpenForSale();
  // }, [orders]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     setLoading(true);
  //     console.log(nftDetails.nHash, nftDetails.nNftImage);
  //     if (nftDetails && nftDetails._id) {
  //       let data = await getAllBidsByNftId(nftDetails._id);
  //       console.log(data);
  //       let _highestBid = {};
  //       _highestBid = data?.highestBid;
  //       console.log(data);
  //       // data = data?.data;

  //       if (data.length > 0 && isEmpty(data[0])) data = [];
  //       setBids(data);
  //       setHighestBid(_highestBid);
  //     }
  //     setLoading(false);
  //   };
  //   fetch();
  // }, [nftDetails]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     let payableBidAmount = new BigNumber(ethers.utils.parseEther(bidPrice ? bidPrice : '0').toString()).multipliedBy(
  //       new BigNumber(bidQty?.toString()),
  //     );
  //     let allowance = new BigNumber(selectedOrderPaymentTokenData?.allowance);

  //     setIsApproved(allowance.isGreaterThanOrEqualTo(payableBidAmount));
  //   };
  //   fetch();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentOrderId, currentUser, selectedOrderPaymentTokenData, bidPrice]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log(isOwned);
  //   });
  // });

  //*======================= Popups ==========

  // Buy NFTs
  const modal = (
    <PopupModal
      content={
        <div className="popup-content1">
          <h3 className="modal_heading">Checkout</h3>
          <p className="bid_buy_text">
            You are about to purchase a{' '}
            <strong>
              {nftDetails
                ? nftDetails.nTitle?.length > 15
                  ? nftDetails.nTitle.slice(0, 15) + '...'
                  : nftDetails.nTitle
                : ''}
            </strong>{' '}
            from <br />
            <strong>
              {authorDetails
                ? authorDetails.sUserName
                  ? authorDetails.sUserName
                  : authorDetails.sWalletAddress
                  ? authorDetails.sWalletAddress.slice(0, 11) + '...' + authorDetails.sWalletAddress.slice(38, 42)
                  : ''
                : ''}
            </strong>
          </p>
          <div className="bid_user_details">
            <div className="polygonLogo">
              <img src={PolygonLogo} />
            </div>
            <div className="bid_user_address">
              <div>
                <span className="adr">{`${currentUser?.slice(0, 11) + '...' + currentUser?.slice(38, 42)}`}</span>
                <span className="badge badge-success">Connected</span>
              </div>
              <span className="pgn">Polygon</span>
            </div>
          </div>
          {nftDetails.nType !== 1 ? (
            <>
              <h6 className="enter_quantity_heading required"> Please Enter the Quantity</h6>
              <input
                className="form-control quantity-input-fields"
                type="text"
                placeholder="0"
                min="1"
                value={buyQuantity}
                onKeyPress={(e) => {
                  if (!/^\d*$/.test(e.key)) e.preventDefault();
                }}
                onChange={(e) => {
                  if (Number(e.target.value) > Number(currOrderLeftQty)) {
                    NotificationManager.error('Quantity should be less than order quantity', '', 800);
                    return;
                  }
                  setBuyQuantity(e.target.value);
                  setWillPay((e.target.value * currentBuyPrice).toFixed(4));
                }}
              ></input>
            </>
          ) : (
            ''
          )}

          <div className="bid_user_calculations">
            {placeBidCal?.map(({ key, value }) => {
              return (
                <div className="cal_div">
                  <span>{key}</span>
                  <span className="cal_div_value">
                    {value} {CURRENCY}
                  </span>
                </div>
              );
            })}
          </div>

          {Number(willPay) === 0 ? (
            ''
          ) : Number(willPay) > Number(userBalance) ? (
            <p className="disabled_text">Insufficient Balance in {CURRENCY}</p>
          ) : (
            <button
              disabled={loading}
              className="btn-main btn-buyNow content-btn1 mt-4"
              // style={{ color: props.color }}
              min="1"
              onClick={async () => {
                let res1 = await handleNetworkSwitch(currentUser);
                setCookie('balance', res1, { path: '/' });
                if (res1 === false) return;
                setIsPopup(false);
                setCheckoutLoader(true);
                if (!currentUser) {
                  NotificationManager.error('Please try to reconnect wallet', '', 800);
                  setLoading(false);
                  return;
                }

                let bal = new BigNumber(convertToEth(cookies.balance));
                let payableAmount;
                if (nftDetails && nftDetails.nType === 1)
                  payableAmount = new BigNumber(1).multipliedBy(new BigNumber(currentBuyPrice));
                else payableAmount = new BigNumber(buyQuantity).multipliedBy(new BigNumber(currentBuyPrice));

                if (payableAmount.isGreaterThan(bal)) {
                  NotificationManager.error('Not enough balance', '', 800);
                  setLoading(false);
                  return;
                }
                if (Number(buyQuantity) < 1) {
                  NotificationManager.error("Quantity can't be zero", '', 800);
                  setLoading(false);
                  return;
                }

                let isERC;
                if (nftDetails && nftDetails.nType === 1) {
                  isERC = true;
                } else {
                  isERC = false;
                }

                let res = await handleBuyNft(
                  currentOrderId,
                  isERC,
                  currentUser?.toLowerCase(),
                  cookies.balance ? cookies.balance : 0,
                  // window.sessionStorage.getItem("balance"),
                  buyQuantity,
                  nftDetails.nLazyMintingStatus,
                );
                if (res === false) {
                  setLoading(false);
                  setCheckoutLoader(false);
                  return;
                }
                try {
                  let historyMetaData = {
                    nftId: nftDetails._id,
                    userId: nftDetails.nCreater._id,
                    action: 'Purchase',
                    actionMeta: 'Default',
                    message: `${buyQuantity} Quantity For ${currentOrderMinBid} ${CURRENCY} by ${
                      currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42)
                    }`,
                    created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                  };

                  await InsertHistory(historyMetaData);
                } catch (e) {
                  console.log('error in history api', e);
                  return;
                }
                setCheckoutLoader(false);
              }}
            >
              Buy Now
            </button>
          )}
        </div>
      }
      handleClose={() => {
        setIsPopup(!isPopup);
        setBuyQuantity(1);
        setBidPrice('');
        setWillPay('0');
        setCheckoutLoader(false);
      }}
    />
  );

  const transferModal = (
    <PopupModal
      content={
        <div className="popup-content1">
          <h3 className="enter_quantity_heading required"> Please Enter the Beneficiary</h3>
          <input
            className="form-control quantity-input-fields"
            type="text"
            placeholder="Please enter the address"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            required
          ></input>
          <h3 className="enter_quantity_heading required"> Please Enter the Quantity</h3>
          <input
            className="form-control quantity-input-fields"
            type="text"
            min="1"
            step="1"
            disabled={nftDetails ? nftDetails.nType === 1 : false}
            placeholder="Please enter quantity like 1,2.."
            value={transferQuantity}
            onKeyPress={(e) => {
              if (!/^\d*$/.test(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              if (Number(e.target.value) > Number(ownedQuantity)) {
                NotificationManager.error('Transfer quantity should be less than owned quantity', '', 800);

                setTransferLoader(false);
                return;
              }

              setTransferQuantity(e.target.value);
            }}
          ></input>
          <button
            className="btn-main content-btn1 mt-4 btn-btnTransfer"
            style={{ color: props.color }}
            onClick={async () => {
              let res1 = await handleNetworkSwitch(currentUser);
              setCookie('balance', res1, { path: '/' });
              if (res1 === false) return;
              setIsTransferPopup(false);
              setTransferLoader(true);
              if (!checkIfValidAddress(beneficiary)) {
                NotificationManager.error('Invalid address', '', 800);
                setTransferLoader(false);
                return;
              }
              if (currentUser.toLowerCase() === beneficiary.toLowerCase()) {
                NotificationManager.error('Transfer to your wallet is not permitted', '', 800);
                setTransferLoader(false);
                return;
              }
              if (Number(transferQuantity) < 1) {
                NotificationManager.error("Quantity can't be zero", '', 800);
                setTransferLoader(false);
                return;
              }

              if (nftDetails) {
                let res;
                if (haveOrder === true) {
                  res = await handleNftTransfer(
                    nftDetails.nCollection,
                    currentUser,
                    beneficiary,
                    transferQuantity,
                    nftDetails.nTokenID,
                    nftDetails.nType === 1,
                    nftDetails._id,
                    connectedUserOrderId,
                  );
                } else {
                  res = await handleNftTransfer(
                    nftDetails.nCollection,
                    currentUser,
                    beneficiary,
                    transferQuantity,
                    nftDetails.nTokenID,
                    nftDetails.nType === 1,
                    nftDetails._id,
                  );
                }

                if (res === false) {
                  NotificationManager.error('Something Went Wrong', '', 800);
                  setTransferLoader(false);
                  return;
                }

                try {
                  let historyMetaData = {
                    nftId: nftDetails._id,
                    userId: nftDetails.nCreater._id,
                    action: 'Transfer',
                    actionMeta: 'Default',
                    message: `${transferQuantity} Quantity to ${
                      beneficiary.slice(0, 3) + '...' + beneficiary.slice(39, 42)
                    } by ${currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42)}`,
                    created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                  };

                  await InsertHistory(historyMetaData);
                } catch (e) {
                  console.log('error in history api', e);
                  return;
                }
              }

              setTransferLoader(false);
            }}
          >
            Transfer NFT
          </button>
        </div>
      }
      handleClose={() => {
        setIsTransferPopup(!isTransferPopup);
      }}
    />
  );

  const hiddenContentModal = (
    <PopupModal
      content={
        <div className="popup-content1">
          {loading ? <Loader /> : ''}
          <h3 style={{ 'font-size': 'x-large' }}>Hidden Content</h3>
          <h5 style={{ color: 'lightslategrey' }}>Hidden content is some secret information from seller to you</h5>
          <h4 style={{ color: '#53a0b5' }}>
            {isOwned && nftDetails ? (
              nftDetails.nLockedContent ? (
                <div className="show-hidden-content">{nftDetails.nLockedContent}</div>
              ) : (
                <div className="not-authorized">No Content!!</div>
              )
            ) : (
              <div className="not-authorized">You don't have Authorization!!</div>
            )}
          </h4>
        </div>
      }
      handleClose={() => {
        setIsUnlocked(!isUnlocked);
      }}
    />
  );

  const placeBidModal = (
    <PopupModal
      content={
        <div className="popup-content1">
          <h3 className="modal_heading">Checkout</h3>
          <p className="bid_buy_text">
            You are about to place a bid for{' '}
            <strong>
              {nftDetails
                ? nftDetails.nTitle?.length > 15
                  ? nftDetails.nTitle.slice(0, 15) + '...'
                  : nftDetails.nTitle
                : ''}
            </strong>{' '}
            from <br />
            <strong>
              {authorDetails
                ? authorDetails.sUserName
                  ? authorDetails.sUserName
                  : authorDetails.sWalletAddress
                  ? authorDetails.sWalletAddress.slice(0, 11) + '...' + authorDetails.sWalletAddress.slice(38, 42)
                  : ''
                : ''}
            </strong>
          </p>
          <div className="bid_user_details">
            <div className="polygonLogo">
              <img src={PolygonLogo} />
            </div>
            <div className="bid_user_address">
              <div>
                <span className="adr">{`${currentUser?.slice(0, 11) + '...' + currentUser?.slice(38, 42)}`}</span>
                <span className="badge badge-success">Connected</span>
              </div>
              <span className="pgn">Polygon</span>
            </div>
          </div>
          <h6 className="enter_quantity_heading required">Please Enter the Bid Quantity</h6>
          <input
            className="form-control quantity-input-fields"
            type="text"
            min="1"
            step="1"
            placeholder="Please Enter the Quantity"
            disabled={nftDetails ? nftDetails.nType === 1 : false}
            value={bidQty}
            onKeyPress={(e) => {
              if (!/^\d*$/.test(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              if (Number(e.target.value) > Number(currOrderLeftQty)) {
                NotificationManager.error("Quantity should be less than seller's order", '', 800);

                setPlaceBidLoader(false);
                return;
              }
              setBidQty(e.target.value);

              setWillPay((e.target.value * bidPrice).toFixed(4));
            }}
          ></input>
          <h6 className="enter_price_heading required">Please Enter the Bid Price</h6>

          <input
            className="form-control price-input-fields"
            type="text"
            min="1"
            placeholder="Please Enter Price"
            value={bidPrice}
            onKeyPress={(e) => {
              if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              if (Number(e.target.value) > 100000000000000) {
                return;
              }
              const re = /[+-]?[0-9]+\.?[0-9]*/;
              let val = e.target.value;
              if (e.target.value === '' || re.test(e.target.value)) {
                const numStr = String(val);
                if (numStr.includes('.')) {
                  if (numStr.split('.')[1].length > 8) {
                  } else {
                    if (val.split('.').length > 2) {
                      val = val.replace(/\.+$/, '');
                    }
                    if (val.length === 2 && val !== '0.') {
                      val = Number(val);
                    }
                    setBidPrice(val);
                    setWillPay((val * bidQty).toFixed(4));
                  }
                } else {
                  if (val.split('.').length > 2) {
                    val = val.replace(/\.+$/, '');
                  }
                  if (val.length === 2 && val !== '0.') {
                    val = Number(val);
                  }
                  setBidPrice(val);
                  setWillPay((val * bidQty).toFixed(4));
                }
              }
            }}
          ></input>

          <div className="bid_user_calculations">
            {placeBidCal?.map(({ key, value }) => {
              return (
                <div className="cal_div">
                  <span>{key}</span>
                  <span className="cal_div_value">
                    {value} {selectedTokenSymbol}
                  </span>
                </div>
              );
            })}
          </div>

          {Number(willPay) === 0 ? (
            ''
          ) : Number(willPay) > Number(userBalance) ? (
            <p className="disabled_text">Insufficient Balance in {selectedTokenSymbol}</p>
          ) : (
            <button
              className="btn-main content-btn1 mt-4 btn-placeABid"
              style={{ color: props.color }}
              onClick={async () => {
                let res = await handleNetworkSwitch(currentUser);
                setCookie('balance', res, { path: '/' });
                if (res === false) return;
                setIsPlaceABidPopup(false);
                if (!bidPrice) return;
                if (Number(bidQty) < 1) {
                  NotificationManager.error("Quantity can't be less than or equal to zero", '', 800);
                  setPlaceBidLoader(false);
                  return;
                }
                setPlaceBidLoader(true);
                if (Number(bidPrice) < Number(currentOrderMinBid)) {
                  NotificationManager.error(
                    `Price should be more than ${currentOrderMinBid} ${selectedOrderPaymentTokenData?.symbol}`,
                    '',
                    800,
                  );
                  setPlaceBidLoader(false);
                  return;
                }
                if (nftDetails && currentOrderId && currentUser && currentOrderSeller) {
                  await createBid(
                    nftDetails._id,
                    currentOrderId,
                    currentOrderSeller,
                    currentUser,
                    nftDetails.nType === 1,
                    bidQty,
                    bidPrice ? bidPrice : 0,
                    nftDetails.nLazyMintingStatus,
                  );
                  setIsPlaceABidPopup(false);
                  setPlaceBidLoader(false);
                }
              }}
            >
              {'Place A Bid'}
            </button>
          )}
        </div>
      }
      handleClose={() => {
        setIsPlaceABidPopup(!isPlaceABidPopup);
        setBidQty(1);
        setBidPrice('');
        setWillPay('0');
      }}
    />
  );

  //*======================= Render Functions ==============

  const RemoveFromSale = (seller, price, orderId, oCreated, deadline, key, qty, qtySold) => (
    <div className="de_tab">
      {removeFromSaleLoader ? showProcessingModal(`Removing ${qty} qty from sale. Please do not refresh...`) : ''}

      <div className="row">
        <div className="col item_author">
          <div className="p_list">
            <div className="p_list_pp">
              <span>
                <img className="lazy" src={seller && seller.sProfilePicUrl ? seller.sProfilePicUrl : Avatar} alt="" />
              </span>
            </div>
            <div className="p_list_info bidsList">
              <div className="row">
                <div className="col vCenter bidsText">
                  <b>
                    {seller.length > 20
                      ? seller.slice(0, 6) + '....' + seller.slice(seller.length - 6, seller.length)
                      : seller}
                  </b>
                  <span>
                    {qty - qtySold} / {nftDetails.nQuantity}{' '}
                    {qty - qtySold / nftDetails.nQuantity > 1 ? 'editions' : 'edition'} for{' '}
                    <b>
                      {price} {CURRENCY}
                    </b>{' '}
                    each on sale
                  </span>
                </div>
                <div className="d-flex flex-wrap">
                  <div className="vCenter itemDet-btn">
                    <span
                      className={
                        removeFromSaleLoader
                          ? 'spn-disabled btn-main btn-removefromsale'
                          : 'btn-main btn-removefromsale'
                      }
                      onClick={async () => {
                        let res1 = await handleNetworkSwitch(currentUser);
                        setCookie('balance', res1, { path: '/' });
                        if (res1 === false) return;
                        if (!currentUser) {
                          setNotConnectedModal(true);

                          setRemoveFromSaleLoader(false);
                          return;
                        }
                        setRemoveFromSaleLoader(true);
                        let res = await handleRemoveFromSale(orderId, currentUser?.toLowerCase());
                        if (res === false) {
                          setRemoveFromSaleLoader(false);
                          return;
                        }
                        try {
                          let historyMetaData = {
                            nftId: nftDetails._id,
                            userId: nftDetails.nCreater._id,
                            action: 'Marketplace',
                            actionMeta: 'Unlisted',
                            message: `${qty} editions by ${
                              currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42)
                            }`,
                            created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                          };

                          await InsertHistory(historyMetaData);
                        } catch (e) {
                          console.log('error in history api', e);
                          return;
                        }
                        setRemoveFromSaleLoader(false);
                      }}
                    >
                      Remove From Sale
                    </span>
                  </div>
                  {nftDetails?.nLazyMintingStatus?.toString() !== '1' ? (
                    <div className="vCenter itemDet-btn">
                      <span
                        className={
                          transferLoader ? 'spn-disabled btn-main btn-btnTransfer' : 'btn-main btn-btnTransfer'
                        }
                        onClick={async () => {
                          let res1 = await handleNetworkSwitch(currentUser);
                          setCookie('balance', res1, { path: '/' });
                          if (res1 === false) return;
                          if (!currentUser) {
                            setNotConnectedModal(true);

                            setTransferLoader(false);
                            return;
                          }
                          setIsTransferPopup(true);
                        }}
                      >
                        Transfer NFT
                      </span>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RemoveFromAuction = (
    seller,
    price,
    orderId,
    oCreated,
    key,
    qty,
    deadline,
    qtySold,
    paymentTokenData,
    timestamp,
  ) => (
    <div className="de_tab">
      <div className="row">
        <div className="col item_author">
          <div className="p_list">
            <div className="p_list_pp">
              <span>
                <img className="lazy" src={seller && seller.sProfilePicUrl ? seller.sProfilePicUrl : Avatar} alt="" />
              </span>
            </div>
            <div className="p_list_info bidsList">
              <div className="row">
                <div className="col vCenter bidsText">
                  <b>
                    {seller.length > 20
                      ? seller.slice(0, 6) + '....' + seller.slice(seller.length - 6, seller.length)
                      : seller}{' '}
                  </b>
                  <br></br>
                  {timestamp !== GENERAL_TIMESTAMP ? 'Put on Timed Auction ' : 'Open for Bids '} with minimum bid of{' '}
                  <b>
                    {price} {paymentTokenData ? paymentTokenData.symbol : ''}
                  </b>
                  <span>
                    at {qty - qtySold}/{nftDetails ? nftDetails.nQuantity : 0}{' '}
                    {qty - qtySold / (nftDetails ? nftDetails.nQuantity : 0) > 1 ? 'editions' : 'edition'} for{' '}
                    <b>
                      {price} {paymentTokenData?.symbol}
                    </b>{' '}
                    each
                  </span>
                  <div className="spacer-10"></div>
                  {timestamp !== GENERAL_TIMESTAMP ? (
                    !orderState[key] ? (
                      <>
                        Auctions ends in
                        <div className="de_countdown">
                          <Clock deadline={deadline} onAuctionEnd={onAuctionEnd} index={key} />
                        </div>
                      </>
                    ) : (
                      ''
                    )
                  ) : (
                    ''
                  )}
                </div>
                <div className="d-flex flex-wrap">
                  <div className="vCenter itemDet-btn">
                    <span
                      className={loading ? 'spn-disabled btn-removefromauction' : 'btn-main btn-removefromauction'}
                      onClick={async () => {
                        let res1 = await handleNetworkSwitch(currentUser);
                        setCookie('balance', res1, { path: '/' });
                        if (res1 === false) return;
                        if (!currentUser) {
                          setNotConnectedModal(true);

                          setRemoveFromSaleLoader(false);
                          return;
                        }
                        setRemoveFromSaleLoader(true);
                        // nftDetails.nType === 1
                        // ?
                        let res = await handleRemoveFromAuction(orderId, currentUser?.toLowerCase());
                        if (res === false) {
                          setRemoveFromSaleLoader(false);
                          return;
                        }
                        try {
                          let historyMetaData = {
                            nftId: nftDetails._id,
                            userId: nftDetails.nCreater._id,
                            action: 'Marketplace',
                            actionMeta: 'Unlisted',
                            message: `${qty} editions by ${
                              currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42)
                            }`,
                            created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                          };

                          await InsertHistory(historyMetaData);
                          setRemoveFromSaleLoader(false);
                        } catch (e) {
                          console.log('error in history api', e);
                          setRemoveFromSaleLoader(false);
                          return;
                        }

                        // : setIsPopup(true);
                        // : handleBuyNft(orders[0]?._id, false, props.account?.account);
                      }}
                    >
                      Remove From Auction
                    </span>
                  </div>
                  {nftDetails?.nLazyMintingStatus?.toString() !== '1' ? (
                    <div className="vCenter itemDet-btn">
                      <span
                        className={
                          transferLoader ? 'spn-disabled btn-main btn-btnTransfer' : 'btn-main btn-btnTransfer'
                        }
                        onClick={async () => {
                          let res1 = await handleNetworkSwitch(currentUser);
                          setCookie('balance', res1, { path: '/' });
                          if (res1 === false) return;
                          if (!currentUser) {
                            setNotConnectedModal(true);

                            setTransferLoader(false);
                            return;
                          }
                          setTransferLoader(false);
                          setIsTransferPopup(true);
                        }}
                      >
                        Transfer NFT
                      </span>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const placeABid = (
    seller,
    price,
    orderId,
    oCreated,
    timestamp,
    key,
    auctionEndDate,
    qty,
    paymentTokenData,
    sellerId,
    qtySold,
    isUserHaveActiveBid,
  ) => {
    return (
      <div className="de_tab" key={key}>
        {/* <div className="p_list_pp">
          <span>
            <img className="lazy" src="/img/author/author-5.jpg" alt="" />
          </span>
        </div> */}
        <div className="row">
          <div className="col item_author">
            <div className="p_list">
              <div className="p_list_pp">
                <span>
                  <img className="lazy" src={seller && seller.sProfilePicUrl ? seller.sProfilePicUrl : Avatar} alt="" />
                </span>
              </div>
              <div className="p_list_info">
                <div className="row">
                  <div className="col vCenter bidsText">
                    <b>
                      {seller.length > 20
                        ? seller.slice(0, 6) + '....' + seller.slice(seller.length - 6, seller.length)
                        : seller}
                    </b>
                    <br></br>
                    {timestamp !== GENERAL_TIMESTAMP ? 'Put on Timed Auction' : 'Open for Bids'} with minimum bid of{' '}
                    <b>
                      {price} {paymentTokenData ? paymentTokenData.symbol : ''}
                    </b>
                    <span>
                      at {qty - qtySold}/{nftDetails ? nftDetails.nQuantity : 0}{' '}
                      {qty - qtySold / (nftDetails ? nftDetails.nQuantity : 0) > 1 ? 'editions' : 'edition'} for{' '}
                      <b>
                        {price} {paymentTokenData?.symbol}
                      </b>{' '}
                      each
                    </span>
                    <div className="spacer-10"></div>
                    {timestamp !== GENERAL_TIMESTAMP ? (
                      !orderState[key] ? (
                        <>
                          Auctions ends in
                          <div className="de_countdown">
                            <Clock deadline={auctionEndDate} onAuctionEnd={onAuctionEnd} index={key} />
                          </div>
                        </>
                      ) : (
                        ''
                      )
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="vCenter itemDet-btn">
                    <span
                      className={
                        new Date(auctionEndDate) < new Date() ? 'spn-disabled  btn-placeABid' : 'btn-main btn-placeABid'
                      }
                      onClick={async () => {
                        let res = await handleNetworkSwitch(currentUser);
                        setCookie('balance', res, { path: '/' });
                        if (res === false) return;
                        if (new Date(auctionEndDate) < new Date()) {
                          return;
                        }
                        if (!currentUser) {
                          setNotConnectedModal(true);

                          setPlaceBidLoader(false);
                          return;
                        }

                        setSelectedOrderPaymentTokenData(paymentTokenData);
                        setCurrOrderLeftQty(qty - qtySold);
                        setCurrentOrderMinBid(price);
                        setCurrentOrderId(orderId);
                        setCurrentOrderSeller(sellerId);
                        setIsPlaceABidPopup(true);
                      }}
                    >
                      {new Date(auctionEndDate) >= new Date() && !orderState[key]
                        ? isUserHaveActiveBid
                          ? 'Update Bid'
                          : 'Place A Bid'
                        : 'Auction Ended'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="spacer-10"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const buyNow = (seller, price, orderId, oCreated, key, qtyLeft, qty, orderType) => (
    <div className="de_tab">
      <div className="row">
        <div className="col item_author">
          <div className="p_list">
            <div className="p_list_pp">
              <span>
                <img className="lazy" src={seller && seller.sProfilePicUrl ? seller.sProfilePicUrl : Avatar} alt="" />
              </span>
            </div>
            <div className="p_list_info">
              <div className="row">
                <div className="col vCenter bidsText">
                  <b>
                    {seller.length > 20
                      ? seller.slice(0, 6) + '....' + seller.slice(seller.length - 6, seller.length)
                      : seller}
                  </b>
                  <span>
                    {qtyLeft} / {qty} {qtyLeft / qty > 1 ? 'editions' : 'edition'} for{' '}
                    <b>
                      {price} {CURRENCY}
                    </b>{' '}
                    each
                  </span>
                </div>
                <div className="vCenter itemDet-btn">
                  <span
                    className="btn-main btn-buyNow"
                    onClick={async () => {
                      let res = await handleNetworkSwitch(currentUser);
                      setCookie('balance', res, { path: '/' });
                      if (res === false) return;
                      if (!currentUser) {
                        setNotConnectedModal(true);

                        setLoading(false);
                        return;
                      }

                      setCurrentBuyPrice(price);
                      setWillPay((price * 1).toFixed(4));
                      setCurrOrderLeftQty(qtyLeft);
                      setCurrOrderType(orderType);
                      setCurrentOrderId(orderId);
                      setCurrentOrderMinBid(price);
                      setIsPopup(true);
                    }}
                  >
                    Buy Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotForSale = (key) => (
    <div className="row">
      <div className="col-md-12">
        <div className="p_list">
          <ul className="de_nav">
            <li id="Mainbtn" className="active">
              Not For Sale
            </li>
          </ul>
          <div className="c-p_list_pp">
            <span className="text-break">
              Created by: {nftDetails && nftDetails.nCreater ? nftDetails.nCreater.sWalletAddress : '0x00..'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const PutOnMarketPlace = (qty) => (
    <div className="row">
      <div className="col item_author">
        <div className="p_list">
          <div className="p_list_pp">
            {/* <span>
              <img
                className="lazy"
                src={authorDetails && authorDetails.sProfilePicUrl ? authorDetails.sProfilePicUrl : Avatar}
                alt=""
              />
            </span> */}
          </div>
          <div className="p_list_info bidsList">
            <div className="row">
              <div className="col vCenter bidsText">
                <b>
                  Created by{' '}
                  {authorDetails?.sWalletAddress?.length > 20
                    ? authorDetails?.sWalletAddress?.slice(0, 6) +
                      '....' +
                      authorDetails?.sWalletAddress.slice(
                        authorDetails?.sWalletAddress?.length - 6,
                        authorDetails?.sWalletAddress?.length,
                      )
                    : authorDetails?.sWalletAddress}
                </b>
                <br></br> at {qty}/{nftDetails ? nftDetails.nQuantity : 0}{' '}
                {qty / (nftDetails ? nftDetails.nQuantity : 0) > 1 ? 'editions' : 'edition'} each
              </div>

              <div className="d-flex flex-wrap">
                <div className="vCenter itemDet-btn">
                  <span
                    className={loading ? 'spn-disabled btn-main btn-putonMarket' : 'btn-main btn-putonMarket'}
                    onClick={() => {
                      if (!currentUser) {
                        setNotConnectedModal(true);
                        NotificationManager.error('Please connect your wallet', '', 800);
                        setPutOnMarketplaceLoader(false);
                        return;
                      }
                      toggleMarketplace();
                    }}
                  >
                    Put On Marketplace
                  </span>
                </div>
                {nftDetails?.nLazyMintingStatus?.toString() !== '1' ? (
                  <div className="vCenter itemDet-btn">
                    <span
                      className={
                        putOnMarketplaceLoader ? 'spn-disabled btn-main btn-btnTransfer' : 'btn-main btn-btnTransfer'
                      }
                      onClick={async () => {
                        console.log(nftDetails);
                        let res1 = await handleNetworkSwitch(currentUser);
                        setCookie('balance', res1, { path: '/' });
                        if (res1 === false) return;
                        if (!currentUser) {
                          setNotConnectedModal(true);
                          NotificationManager.error('Please connect your wallet', '', 800);
                          setPutOnMarketplaceLoader(false);
                          return;
                        }
                        setIsTransferPopup(true);
                      }}
                    >
                      Transfer NFT
                    </span>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getAction = (action, actionMeta) => {
    if (action === 'Marketplace') {
      if (actionMeta === 'Listed') {
        return 'Listed';
      } else return 'Unlisted';
    } else if (action === 'Purchase') {
      return 'Purchased';
    } else if (action === 'Bids') {
      if (actionMeta === 'Accept') {
        return 'Accepted';
      } else if (actionMeta === 'Reject') return 'Rejected';
    } else if (action === 'Transfer') {
      return 'Transferred';
    } else if (action === 'Creation') {
      return 'Created';
    }
    return '';
  };

  //*======== ========= ========

  return (
    <div>
      {/* <GlobalStyles /> */}

      {loading ? showProcessingModal('Loading') : ''}
      {isPopup ? modal : ''}
      {/* 
      {checkoutLoader ? showProcessingModal('Transaction is in progress. Please do not refresh...') : ''}
      {putOnMarketplaceLoader ? showProcessingModal(`Placing on marketplace. Please do not refresh...`) : ''}
      {transferLoader
        ? showProcessingModal(
          `Transferring ${transferQuantity} qty to ${beneficiary.slice(0, 3) + '...' + beneficiary.slice(39, 42)
          }. Please do not refresh...`,
        )
        : ''}
      {placeBidLoader ? showProcessingModal('Placing bid. Please do not refresh...') : ''}

      {removeFromSaleLoader ? showProcessingModal('Removing NFT from sale. Please do not refresh...') : ''}
 */}
      {/* {isTransferPopup ? transferModal : ''}
      {isPlaceABidPopup ? placeBidModal : ''}
      {isUnlocked ? hiddenContentModal : ''}
      {showNotConnectedModal ? (
        <ConnectWallet
          content={'Get started with your wallet to sign messages and send transactions to Polygon blockchain'}
          handleClose={() => setNotConnectedModal(false)}
        />
      ) : (
        ''
      )} */}

      <section className="container">
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-6 text-center nft_image_box">
            <div className="c-nft-img-box">
              <img
                src={`http://${nftDetails.nHash}.ipfs.w3s.link/${nftDetails.nNftImage}`}
                className="img-fluid img-rounded explore_item_img_col nft_image mb-sm-30"
                alt=""
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="item_info">
              <h2>
                {nftDetails ? nftDetails.nTitle : ''}
                {/* ({nftDetails?.nType === 1 ? "Single" : "Multiple"}) */}
              </h2>

              {/* <div className="item_info_counts">
                {highestBid !== undefined && !isEmptyObject(highestBid) ? (
                  <div>
                    <div className="item_info_lock" style={{ cursor: 'pointer' }}>
                      Highest Bid at {Number(convertToEth(highestBid?.oBidPrice?.$numberDecimal)).toFixed(4)}{' '}
                      {highestBid.paymentSymbol}
                    </div>
                  </div>
                ) : (
                  ''
                )}

                {nftDetails.hiddenContent ? (
                  <div>
                    <div
                      className="item_info_lock"
                      onClick={() => setIsUnlocked(!isUnlocked)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={isUnlocked ? 'fa fa-unlock' : 'fa fa-lock'} aria-hidden="true"></i>
                    </div>
                    Home1
                    <p className="hidden-content-label">Hidden Content</p>
                  </div>
                ) : (
                  ''
                )}
              </div> */}

              <p>{nftDetails ? nftDetails.nDescription : ''}</p>

              <div className="de_tab">
                <div className="row">
                  <div className="item_author col-md-6">
                    <h6>Creator</h6>
                    <div className="author_list_pp">
                      {/* <a href={`/author/${nftDetails?.nCreater?._id}`}> */}
                      <span>
                        <img
                          title={
                            nftDetails.nCreater
                              ? nftDetails.nCreater.sWalletAddress.slice(0, 3) +
                                '...' +
                                nftDetails.nCreater.sWalletAddress.slice(39, 42)
                              : ''
                          }
                          className="lazy"
                          v
                          src={authorDetails && authorDetails.sProfilePicUrl ? authorDetails.sProfilePicUrl : Avatar}
                          alt=""
                        />
                      </span>
                      {/* </a> */}
                    </div>
                    <div className="author_list_info">
                      <span>
                        {authorDetails && authorDetails.sWalletAddress
                          ? authorDetails.sUserName
                            ? authorDetails.sUserName
                            : authorDetails.sWalletAddress.slice(0, 3) +
                              '...' +
                              authorDetails.sWalletAddress.slice(39, 42)
                          : ''}
                      </span>
                    </div>
                  </div>

                  <div className="item_collection item_author col-md-6 mt-30">
                    <h6>Collection</h6>
                    <div>
                      <div className="author_list_pp">
                        {/* <a href={`/collection/${nftDetails.nCollection}`}> */}
                        <span>
                          <img
                            className="lazy"
                            src={nftDetails && nftDetails.nCollectionsProfile ? nftDetails.nCollectionsProfile : Avatar}
                            alt=""
                          />
                        </span>
                        {/* </a> */}
                      </div>
                      <div className="author_list_info">
                        <span>
                          {nftDetails && nftDetails.nCollection
                            ? nftDetails.nCollection.slice(0, 3) + '...' + nftDetails.nCollection.slice(39, 42)
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="spacer-40"></div>
              <div className="spacer-10"></div>
              <div className="de_tab">
                <div className="c-tabs overflow-auto">
                  <ul className="de_nav c-de_nav">
                    <li id="Mainbtn1" className="active">
                      <span onClick={handleBtnClick1}>Action</span>
                    </li>
                    <li id="Mainbtn" className="">
                      <span onClick={handleBtnClick}>History</span>
                    </li>
                    <li id="Mainbtn2" className="">
                      <span onClick={handleBtnClick2}>Active Bids</span>
                    </li>
                    <li id="Mainbtn3" className="">
                      <span onClick={handleBtnClick3}>Details</span>
                    </li>
                  </ul>
                </div>

                {isMarketplacePopup ? (
                  <>
                    <PopupModal
                      content={
                        <div className="popup-content1 text-start">
                          <h3 className="modal_headeing">Put on Marketplace</h3>
                          <h6 className="formlabel">Select method</h6>
                          <div className="de_tab tab_methods">
                            <ul className="de_nav text-center">
                              <li id="btn1" className="active" onClick={handleMpShow}>
                                <span>
                                  <i className="fa fa-tag"></i>Fixed price
                                </span>
                              </li>
                              <li id="btn2" onClick={handleMpShow1}>
                                <span>
                                  <i className="fa fa-hourglass-1"></i>Timed auction
                                </span>
                              </li>
                              <li id="btn3" onClick={handleMpShow2}>
                                <span>
                                  <i className="fa fa-users"></i>Open for bids
                                </span>
                              </li>
                            </ul>

                            <div className="de_tab_content pt-3">
                              <div id="tab_opt_1">
                                <h5 className="required">Price</h5>
                                <input
                                  type="text"
                                  name="item_price"
                                  id="item_price"
                                  min="0"
                                  max="18"
                                  value={marketplacePrice}
                                  onKeyPress={(e) => {
                                    if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
                                  }}
                                  onChange={inputPrice}
                                  className="form-control"
                                  placeholder={`Please Enter Price (${CURRENCY})`}
                                />
                              </div>
                            </div>
                          </div>
                          <div id="tab_opt_1">
                            <h5 className="formlabel required">Quantity</h5>
                            <input
                              type="text"
                              name="item_price"
                              id="item_price"
                              min="1"
                              disabled={nftDetails.nType === 1}
                              value={marketplaceQuantity}
                              onKeyPress={(e) => {
                                if (!/^\d*$/.test(e.key)) e.preventDefault();
                              }}
                              onChange={(e) => {
                                if (Number(e.target.value) > Number(ownedQuantity)) {
                                  NotificationManager.error('Quantity should be less than owned quantity', '', 800);

                                  setLoading(false);
                                  return;
                                }
                                setMarketplaceQuantity(e.target.value);
                              }}
                              className="form-control"
                              placeholder={`Please Enter Quantity`}
                            />
                          </div>
                          <div className="de_tab_content pt-3">
                            <div id="tab_opt_2" className="hide">
                              <h5 className="formlabel required">Minimum bid</h5>
                              <input
                                type="text"
                                name="item_price_bid"
                                id="item_price_bid"
                                min="0"
                                max="18"
                                className="form-control"
                                value={minimumBid}
                                onKeyPress={(e) => {
                                  if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
                                }}
                                onChange={(e) => {
                                  if (Number(e.target.value) > 100000000000000) {
                                    return;
                                  }
                                  inputPriceAuction(e);
                                }}
                                placeholder="Enter Minimum Bid"
                              />

                              <div className="spacer-20"></div>

                              <div className="row">
                                <div className="col-md-6">
                                  <h5 className="formlabel required">Payment Token</h5>
                                  <select
                                    className="form-control selectOpt"
                                    onChange={(e) => {
                                      setSelectedTokenAddress(e.target.value);
                                      setSelectedTokenSymbol(getTokenSymbolByAddress(e.target.value));
                                    }}
                                  >
                                    {options
                                      ? options.map((option, key) => {
                                          return <option value={option.value}>{option.title}</option>;
                                        })
                                      : ''}
                                  </select>
                                </div>
                                <div className="col-md-6">
                                  <h5 className="formlabel required">Expiration date</h5>
                                  <input
                                    type="datetime-local"
                                    id="meeting-time"
                                    name="meeting-time"
                                    min={getMaxAllowedDate()}
                                    className="form-control"
                                    onChange={(e) => {
                                      setEndTime(new Date(e.target.value));
                                    }}

                                    // max="2018-06-14T00:00"
                                  ></input>
                                </div>
                              </div>
                            </div>
                            <div id="tab_opt_3" className="hide">
                              <h5 className="formlabel required">Minimum bid</h5>
                              <input
                                type="text"
                                name="item_price_bid"
                                min="0"
                                id="item_price_bid"
                                className="form-control"
                                value={minimumBid}
                                onChange={(e) => {
                                  if (Number(e.target.value) > 100000000000000) {
                                    return;
                                  }
                                  setMinimumBid(e.target.value);
                                }}
                                onKeyPress={(e) => {
                                  if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
                                }}
                                placeholder="Enter Minimum Bid"
                              />

                              <div className="spacer-20"></div>

                              <div className="row">
                                <div className="col-md-6">
                                  <h5 className="formlabel required">Payment Token</h5>
                                  <select
                                    className="form-control selectOpt"
                                    onChange={(e) => {
                                      setSelectedTokenAddress(e.target.value);
                                      setSelectedTokenSymbol(getTokenSymbolByAddress(e.target.value));
                                    }}
                                  >
                                    {options
                                      ? options.map((option, key) => {
                                          return <option value={option.value}>{option.title}</option>;
                                        })
                                      : ''}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="spacer-single"></div>
                          <button
                            id="submit"
                            className="btn-main btn-putonMarket"
                            onClick={async () => {
                              if (!currentUser) {
                                setNotConnectedModal(true);
                                NotificationManager.error('Please connect your wallet', '', 800);

                                return;
                              }

                              if (
                                parseInt(marketplaceQuantity) > parseInt(nftDetails.nQuantity) ||
                                parseInt(marketplaceQuantity) < 1
                              ) {
                                NotificationManager.error('Incorrect Quantity Amount', '', 800);

                                return;
                              }
                              if (Number(marketplacePrice) <= 0 && Number(minimumBid) <= 0) {
                                NotificationManager.error('Price should not be less than or equal to 0', '', 800);

                                return;
                              }
                              if (isTimedAuction && endTime === undefined) {
                                NotificationManager.error('Please Select an Expiration Date', '', 800);
                                return;
                              }

                              setMarketplacePopup(false);
                              setPutOnMarketplaceLoader(true);
                              let orderData = {
                                nftId: nftDetails._id,
                                collection: nftDetails.nCollection,
                                price: marketplacePrice ? marketplacePrice : '0',
                                quantity: marketplaceQuantity,
                                saleType: marketplaceSaleType === 1 || marketplaceSaleType === 2 ? 1 : 0,
                                salt: Math.round(Math.random() * 10000000),
                                endTime: endTime ? endTime : GENERAL_TIMESTAMP,
                                chosenType: marketplaceSaleType,
                                minimumBid: minimumBid !== '' ? minimumBid : 0,
                                auctionEndDate: endTime ? endTime : new Date(GENERAL_DATE),
                                tokenAddress: marketplaceSaleType === 0 ? ZERO_ADDRESS : selectedTokenAddress,
                                tokenId: nftDetails.nTokenID,
                                erc721: nftDetails.nType === 1,
                              };
                              console.log(res)
                              let res = await putOnMarketplace(
                                currentUser ? currentUser : '',
                                orderData,
                                nftDetails.nLazyMintingStatus,
                              );

                              if (res === false) {
                                setPutOnMarketplaceLoader(false);

                                return;
                              }
                              try {
                                let historyMetaData = {
                                  nftId: nftDetails._id,
                                  userId: nftDetails.nCreater._id,
                                  action: 'Marketplace',
                                  actionMeta: 'Listed',
                                  message: `${marketplaceQuantity} Quantity For ${
                                    marketplacePrice ? marketplacePrice : minimumBid ? minimumBid : 0
                                  } ${
                                    marketplaceSaleType === 0 ? CURRENCY : getTokenSymbolByAddress(selectedTokenAddress)
                                  } by ${currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42)}`,
                                  created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                };

                                await InsertHistory(historyMetaData);
                              } catch (e) {
                                console.log('error in history api', e);
                                return;
                              }

                              setPutOnMarketplaceLoader(false);
                            }}
                          >
                            Put On Marketplace
                          </button>
                        </div>
                      }
                      handleClose={toggleMarketplace}
                    />
                    {/* {loading ? <Loader /> : ""} */}
                  </>
                ) : (
                  ''
                )}

                <div className="de_tab_content">
                  {openMenu && (
                    <div className="tab-1 onStep fadeIn historyTab">
                      {history && history?.length > 0
                        ? history.map((h, i) => {
                            console.log(
                              'history time',
                              moment(h.sCreated, 'YYYY-MM-DD HH:mm:ss').add(5, 'hours').add(30, 'minutes').fromNow(),
                            );

                            return (
                              <div className="row customRow">
                                <div className="col-lg-12">
                                  <div className="p_list">
                                    <div className="p_list_pp">
                                      <span>
                                        <img
                                          className="lazy"
                                          src={h && h.sProfilePicUrl ? h.sProfilePicUrl : Avatar}
                                          alt=""
                                        />
                                      </span>
                                    </div>
                                    <div className="p_list_info">
                                      <b>
                                        {getAction(h.action, h.actionMeta).toString().toUpperCase()} {'  '}
                                      </b>
                                      {h.message}
                                      <span>{moment(h.sCreated, 'YYYY-MM-DD HH:mm:ss').fromNow()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        : ''}
                      <div className="row customRow">
                        <div className="col-lg-12">{totalPages > 1 ? 'null' : ''}</div>
                      </div>
                    </div>
                  )}

                  {openMenu1 && (
                    <div className="tab-2 onStep fadeIn">
                      {true
                        ? PutOnMarketPlace(ownedQuantity)
                        : orders != 'null' && orders?.length >= 1 && !isEmpty(orders[0])
                        ? orders.map((order, key) => {
                            if (order.oStatus === 1) {
                              if (order.oType === 0) {
                                if (order?.oSellerWalletAddress?.toLowerCase() === currentUser?.toLowerCase()) {
                                  return RemoveFromSale(
                                    order?.oSellerWalletAddress,
                                    convertToEth(order?.oPrice?.$numberDecimal),
                                    order._id,
                                    order.oCreated,
                                    order.validUpto,
                                    key,
                                    order.oQuantity,
                                    order.quantity_sold,
                                  );
                                } else {
                                  return buyNow(
                                    order.oSellerWalletAddress,
                                    convertToEth(order.oPrice.$numberDecimal),
                                    order._id,
                                    order.oCreated,
                                    key,
                                    order.oQuantity - order.quantity_sold,
                                    order.oQuantity,
                                    order.oType,
                                  );
                                }
                              } else if (order.oType === 1) {
                                if (order?.oSellerWalletAddress?.toLowerCase() === currentUser?.toLowerCase()) {
                                  return RemoveFromAuction(
                                    order.oSellerWalletAddress,
                                    convertToEth(order.oPrice.$numberDecimal),
                                    order._id,
                                    order.oCreated,
                                    key,
                                    order.oQuantity,
                                    order.auction_end_date,
                                    order.quantity_sold,
                                    order.paymentTokenData,
                                    order.oValidUpto,
                                  );
                                } else {
                                  return placeABid(
                                    order.oSellerWalletAddress,
                                    convertToEth(order.oPrice.$numberDecimal),
                                    order._id,
                                    order.oCreated,
                                    order.oValidUpto,
                                    key,
                                    order.auction_end_date,
                                    order.oQuantity,
                                    order.paymentTokenData,
                                    order.oSeller,
                                    order.quantity_sold,
                                    order.isUserHaveActiveBid,
                                  );
                                }
                              }
                            }
                            return '';
                          })
                        : !isOwned && orders !== 'null'
                        ? NotForSale(0)
                        : ''}
                    </div>
                  )}

                  {openMenu2 && (
                    <div className="tab-1 onStep fadeIn">
                      {bids && bids.length >= 1 && nftDetails
                        ? bids.map((bid, key) => {
                            return (
                              <div className="row">
                                <div className="col item_author">
                                  <div className="p_list">
                                    <div className="p_list_pp bidsList">
                                      <span>
                                        <img
                                          className="lazy"
                                          src={bid.bidderProfile ? bid.bidderProfile : Avatar}
                                          alt=""
                                        />
                                      </span>
                                    </div>
                                    <div className="p_list_info bidsList">
                                      <div className="row">
                                        <div className="col vCenter bidsText">
                                          Bid by{' '}
                                          <b>
                                            {bid.bidder.length > 20
                                              ? bid.bidder.slice(0, 6) +
                                                '....' +
                                                bid.bidder.slice(bid.bidder.length - 6, bid.bidder.length)
                                              : bid.bidder}
                                            &nbsp; at
                                          </b>
                                          <br></br> Bid Price &nbsp;
                                          {convertToEth(bid.bidPrice ? +' ' + bid.bidPrice + ' ' : ' 0 ')}
                                          &nbsp;
                                          {bid.paymentSymbol ? bid.paymentSymbol + ' ' : ' '}
                                          For {bid.bidQuantity}/{nftDetails.nQuantity}
                                        </div>
                                        <div className="col vCenter">
                                          <div className="customCol centerAlign">
                                            <div className="button_section">
                                              {currentUser?.toLowerCase() !== bid?.bidder?.toLowerCase() &&
                                              currentUser?.toLowerCase() === bid?.seller?.toLowerCase() ? (
                                                <>
                                                  <button
                                                    className="accept_btn mybtn"
                                                    onClick={async () => {
                                                      let res1 = await handleNetworkSwitch(currentUser);
                                                      setCookie('balance', res1, { path: '/' });
                                                      if (res1 === false) return;
                                                      if (!profile) {
                                                        return;
                                                      }
                                                      if (!currentUser) {
                                                        setNotConnectedModal(true);
                                                        NotificationManager.error(
                                                          'Please connect your wallet',
                                                          '',
                                                          800,
                                                        );
                                                        setLoading(false);
                                                        return;
                                                      }
                                                      setLoading(true);
                                                      let res = await handleAcceptBids(
                                                        bid,
                                                        nftDetails.nType === 1,
                                                        currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42),
                                                        nftDetails.nTitle,
                                                        nftDetails.nLazyMintingStatus,
                                                      );
                                                      if (res === false) {
                                                        setLoading(false);
                                                        return;
                                                      }
                                                      setLoading(false);
                                                    }}
                                                  >
                                                    Accept
                                                  </button>
                                                  <button
                                                    className="reject_btn mybtn"
                                                    onClick={async () => {
                                                      let res1 = await handleNetworkSwitch(currentUser);
                                                      setCookie('balance', res1, { path: '/' });
                                                      if (res1 === false) return;
                                                      if (!currentUser) {
                                                        setNotConnectedModal(true);
                                                        NotificationManager.error(
                                                          'Please connect your wallet',
                                                          '',
                                                          800,
                                                        );
                                                        setLoading(false);
                                                        return;
                                                      }
                                                      setLoading(true);
                                                      await handleUpdateBidStatus(bid.bidId, 'Rejected');
                                                      setLoading(false);
                                                    }}
                                                  >
                                                    Reject
                                                  </button>
                                                </>
                                              ) : currentUser?.toLowerCase() === bid?.bidder?.toLowerCase() &&
                                                currentUser?.toLowerCase() !== bid?.seller?.toLowerCase() ? (
                                                <>
                                                  <button
                                                    className="cancel_btn mybtn"
                                                    onClick={async () => {
                                                      let res1 = await handleNetworkSwitch(currentUser);
                                                      setCookie('balance', res1, { path: '/' });
                                                      if (res1 === false) return;
                                                      if (!currentUser) {
                                                        setNotConnectedModal(true);
                                                        NotificationManager.error(
                                                          'Please connect your wallet',
                                                          '',
                                                          800,
                                                        );
                                                        setLoading(false);
                                                        return;
                                                      }
                                                      setLoading(true);
                                                      await handleUpdateBidStatus(bid.bidId, 'Cancelled');
                                                      setLoading(false);
                                                    }}
                                                  >
                                                    Cancel
                                                  </button>
                                                </>
                                              ) : (
                                                ''
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="spacer-10"></div>
                              </div>
                            );
                          })
                        : ''}
                    </div>
                  )}

                  {openMenu3 && (
                    <div className="tab-1 onStep fadeIn">
                      {loading ? showProcessingModal('Loading') : ''}
                      {/* {nftDetails.nType === 2 ? (
                        <div className="ownedQty">
                          Owned Quantity{" "}
                          <b>{ownedQuantity ? ownedQuantity : 0}</b>
                        </div>
                      ) : (
                        ""
                      )} */}
                      <div className="spacer-20"></div>
                      <div className="nft_attr_section">
                        <div className="row gx-2">
                          {metaData && metaData.length > 0
                            ? metaData.map((data, key) => {
                                return (
                                  <div className="col-lg-4 col-md-6 col-sm-6">
                                    <div className="nft_attr">
                                      <h5>{data.trait_type}</h5>
                                      <h4>{data.value}</h4>
                                    </div>
                                  </div>
                                );
                              })
                            : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ItemDetails;

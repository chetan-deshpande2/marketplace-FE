import React, { useState, useEffect } from "react";
import Clock from "../components/Clock";
import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import { connect } from "react-redux";
import { useParams } from "@reach/router";
//*==================
import { NotificationManager } from "react-notifications";
import PopupModal from "../menu/AccountModal/popupModal.jsx";
import {
  GetIndividualAuthorDetail,
  GetNftDetails,
  LikeNft,
} from "../../apiServices";
import Loader from "../components/loader";
import {
  createBid,
  handleBuyNft,
  handleNftTransfer,
  handleRemoveFromAuction,
  handleRemoveFromSale,
  putOnMarketplace,
} from "../../helpers/sendFunctions";
import { convertToEth } from "../../helpers/numberFormatter";
import {
  CURRENCY,
  GENERAL_DATE,
  GENERAL_TIMESTAMP,
  ZERO_ADDRESS,
} from "../../helpers/constants";
import BigNumber from "bignumber.js";
import contracts from "../../Config/contracts";
import { getMaxAllowedDate } from "../../helpers/getterFunctions";

// import "./../components-css/item-detail.css";

const ipfsAPI = require("ipfs-api");
const ipfs = ipfsAPI("ipfs.infura.io", "5001", {
  protocol: "https",
  auth: "21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439",
});
//*================

const GlobalStyles = createGlobalStyle`
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
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const ItemDetail = (props) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openMenu1, setOpenMenu1] = useState(true);
  const [openMenu2, setOpenMenu2] = useState(false);
  const [openMenu3, setOpenMenu3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState({});
  const [authorDetails, setAuthorDetails] = useState({});

  const [isPopup, setIsPopup] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [isMarketplacePopup, setMarketplacePopup] = useState(false);
  const [marketplacePrice, setMarketplacePrice] = useState();
  const [marketplaceSaleType, setmarketplaceSaleType] = useState(0);
  const [isOwned, setIsOwned] = useState(false);
  const [marketplaceQuantity, setMarketplaceQuantity] = useState(1);

  const [ownedQuantity, setOwnedQuantity] = useState();
  const [minimumBid, setMinimumBid] = useState(0);
  const [endTime, setEndTime] = useState();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState();
  const [beneficiary, setBeneficiary] = useState();
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [isTransferPopup, setIsTransferPopup] = useState(false);
  const [isPlaceABidPopup, setIsPlaceABidPopup] = useState(false);
  const [selectedOrderPaymentTokenData, setSelectedOrderPaymentTokenData] =
    useState();
  const [bidQty, setBidQty] = useState(1);
  const [bidPrice, setBidPrice] = useState("0");
  const [currentOrderId, setCurrentOrderId] = useState();
  const [currentOrderSeller, setCurrentOrderSeller] = useState();
  const [bids, setBids] = useState([]);
  const [currentUser, setcurrentUser] = useState("");

  const [currentBuyPrice, setCurrentBuyPrice] = useState(0);
  const [currOrderLeftQty, setCurrOrderLeftQty] = useState(0);
  const [currentOrderMinBid, setCurrenOrderMinBid] = useState(0);
  const [imageHash, setImageHash] = useState();
  const [metaData, setMetaData] = useState([{}]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [history, setHistory] = useState([]);
  const { id } = useParams();
  // const location = useLocation

  const handleBtnClick = () => {
    setOpenMenu(true);
    setOpenMenu1(false);
    setOpenMenu2(false);
    setOpenMenu3(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById("Mainbtn3").classList.remove("active");
  };

  const handleBtnClick1 = () => {
    setOpenMenu1(true);
    setOpenMenu(false);
    setOpenMenu2(false);
    setOpenMenu3(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById("Mainbtn3").classList.remove("active");
  };

  const handleBtnClick2 = () => {
    setOpenMenu1(false);
    setOpenMenu(false);
    setOpenMenu2(true);
    setOpenMenu3(false);
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn2").classList.add("active");
    document.getElementById("Mainbtn3").classList.remove("active");
  };

  const handleBtnClick3 = () => {
    setOpenMenu1(false);
    setOpenMenu(false);
    setOpenMenu2(false);
    setOpenMenu3(true);
    document.getElementById("Mainbtn1").classList.remove("active");
    document.getElementById("Mainbtn").classList.remove("active");
    document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById("Mainbtn3").classList.add("active");
  };

  const toggleMarketplace = () => {
    setMarketplacePopup(!isMarketplacePopup);
  };

  const options = [
    { value: contracts.WETH, title: "WETH" },
    { value: contracts.USDC, title: "USDC" },
    { value: contracts.USDT, title: "USDT" },
  ];

  const handleMpShow = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("tab_opt_1").classList.remove("hide");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("btn1").classList.add("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.remove("active");
    setmarketplaceSaleType(0);
  };

  const handleMpShow1 = () => {
    document.getElementById("tab_opt_1").classList.add("hide");
    document.getElementById("tab_opt_1").classList.remove("show");
    document.getElementById("tab_opt_2").classList.add("show");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn2").classList.add("active");
    document.getElementById("btn3").classList.remove("active");
    setmarketplaceSaleType(1);
  };

  const handleMpShow2 = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.add("active");
    setmarketplaceSaleType(2);
  };

  const togglePopup = () => {
    setIsPopup(!isPopup);
  };

  const modal = (
    <PopupModal
      content={
        <div className="popup-content1">
          {loading ? <Loader /> : ""}
          <h3 className="enter_quantity_heading"> Please Enter the Quantity</h3>
          <input
            className="form-control quantity-input-fields"
            type="Number"
            placeholder="Please enter quantity like 1,2.."
            value={buyQuantity}
            onChange={(e) => {
              setBuyQuantity(e.target.value);
            }}
          ></input>
          <button
            className="btn-main content-btn1 mt-4"
            // style={{ color: props.color }}
            onClick={async () => {
              if (!props.account && !props.account.account) {
                NotificationManager.error("Please try to reconnect wallet");
                return;
              }
              setLoading(true);
              let bal = new BigNumber(
                convertToEth(window.sessionStorage.getItem("balance"))
              );
              let payableAmount = new BigNumber(buyQuantity).multipliedBy(
                new BigNumber(currentBuyPrice)
              );

              if (payableAmount.isGreaterThan(bal)) {
                NotificationManager.error("Not enough balance");
                return;
              }
              await handleBuyNft(
                currentOrderId,
                false,
                props.account?.account.toLowerCase(),
                props.account?.balance.toString(),
                buyQuantity
              );
              setLoading(false);
            }}
          >
            Buy Now
          </button>
        </div>
      }
      handleClose={togglePopup}
    />
  );

  const transferModal = (
    <PopupModal
      content={
        <div className="popup-content1">
          {loading ? <Loader /> : ""}
          <h3 className="enter_quantity_heading">
            {" "}
            Please Enter the Beneficiary
          </h3>
          <input
            className="form-control quantity-input-fields"
            type="text"
            placeholder="Please enter the address"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          ></input>
          <h3 className="enter_quantity_heading"> Please Enter the Quantity</h3>
          <input
            className="form-control quantity-input-fields"
            type="Number"
            disabled={nftDetails ? nftDetails.nType === 1 : false}
            placeholder="Please enter quantity like 1,2.."
            value={transferQuantity}
            onChange={(e) => {
              if (Number(e.target.value) > Number(ownedQuantity)) {
                NotificationManager.error(
                  "Transfer quantity should be less than owned quantity"
                );
                return;
              }
              setTransferQuantity(Number(e.target.value));
            }}
          ></input>
          <button
            className="btn-main content-btn1 mt-4"
            style={{ color: props.color }}
            onClick={() => {
              setLoading(true);
              if (nftDetails)
                handleNftTransfer(
                  nftDetails.nCollection,
                  props.account.account,
                  beneficiary,
                  transferQuantity,
                  nftDetails.nTokenID,
                  nftDetails.nType === 1,
                  nftDetails._id
                );
              setLoading(false);
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
          {loading ? <Loader /> : ""}
          <h3 style={{ "font-size": "x-large" }}>Hidden Content</h3>
          <h5 style={{ color: "lightslategrey" }}>
            Hidden content is some secret information from seller to you
          </h5>
          <h4 style={{ color: "#53a0b5" }}>
            {isOwned && nftDetails
              ? nftDetails.nLockedContent
              : "You don't have Authorization"}
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
          {loading ? <Loader /> : ""}
          <h3 className="enter_quantity_heading">
            {" "}
            Please Enter the Bid Quantity
          </h3>
          <input
            className="form-control quantity-input-fields"
            type="text"
            placeholder="Please enter the address"
            disabled={nftDetails ? nftDetails.nType === 1 : false}
            value={bidQty}
            onChange={(e) => {
              if (Number(e.target.value) > Number(currOrderLeftQty)) {
                NotificationManager.error(
                  "Quantity should be less that seller's order"
                );
                return;
              }
              setBidQty(Number(e.target.value));
            }}
          ></input>
          <h3 className="enter_price_heading"> Please Enter the Bid Price</h3>

          <input
            className="form-control price-input-fields"
            type="Number"
            min="0"
            step=".01"
            placeholder="Please Enter Price"
            value={bidPrice}
            onChange={(e) => {
              setBidPrice(e.target.value);
            }}
          ></input>
          <button
            className="btn-main content-btn1 mt-4"
            style={{ color: props.color }}
            onClick={async () => {
              setLoading(true);

              if (Number(bidPrice) < Number(currentOrderMinBid)) {
                NotificationManager.error(
                  "Price should be more that minimum bid"
                );
                return;
              }
              if (
                nftDetails &&
                currentOrderId &&
                props.account &&
                props.account.account &&
                currentOrderSeller
              )
                await createBid(
                  nftDetails._id,
                  currentOrderId,
                  currentOrderSeller,
                  props.account.account,
                  nftDetails.nType === 1,
                  bidQty,
                  bidPrice
                );
              setLoading(false);
            }}
          >
            {"Place A Bid"}
          </button>
        </div>
      }
      handleClose={() => {
        setIsPlaceABidPopup(!isPlaceABidPopup);
      }}
    />
  );

  useEffect(() => {
    if (props.account) setcurrentUser(props.account.account);
  }, [props.account]);

  useEffect(() => {
    async function fetch() {
      if (id) {
        setLoading(true);
        let data = await GetNftDetails(id);
        let authorData = [];
        if (data)
          authorData = await GetIndividualAuthorDetail({
            userId: data.nCreater,
          });
        setNftDetails(data);
      }
    }
    fetch();
  }, [id, localStorage.getItem("Authorization")]);

  const RemoveFromSale = (
    seller,
    price,
    orderId,
    oCreated,
    deadline,
    key,
    qty,
    qtySold
  ) => (
    <div className="p_list_info">
      {loading ? <Loader /> : ""}
      On sale at{" "}
      <b>
        {price} {CURRENCY}{" "}
      </b>
      <span>
        by <b>{seller}</b> {oCreated}
      </span>
      {qty - qtySold}/{nftDetails.nQuantity}
      <ul className="de_nav">
        <li id="Mainbtn" className="active">
          <span
            onClick={async () => {
              setLoading(true);

              await handleRemoveFromSale(
                orderId,
                props.account?.account.toLowerCase()
              );
              setLoading(false);
            }}
          >
            Remove From Sale
          </span>
        </li>
      </ul>
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
    timestamp
  ) => (
    <div className="p_list_info">
      {loading ? <Loader /> : ""}
      {timestamp !== GENERAL_TIMESTAMP
        ? "Put on Timed Auction "
        : "Open for Bids "}{" "}
      by <b>{seller} </b>
      <span>
        with minimum bid of{" "}
        <b>
          {price} {paymentTokenData ? paymentTokenData.symbol : ""}
        </b>{" "}
        on {oCreated}
      </span>
      {qty - qtySold}/{nftDetails.nQuantity}
      <ul className="de_nav">
        <li id="Mainbtn" className="active">
          {timestamp !== GENERAL_TIMESTAMP ? (
            <>
              Auctions ends in
              <div className="de_countdown">
                <Clock deadline={deadline} />
              </div>
            </>
          ) : (
            ""
          )}

          <span
            onClick={async () => {
              setLoading(true);

              await handleRemoveFromAuction(
                orderId,
                props.account?.account.toLowerCase()
              );
              setLoading(false);
            }}
          >
            Remove From Auction
          </span>
        </li>
      </ul>
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
    isUserHaveActiveBid
  ) => {
    if (paymentTokenData && bidPrice && bidQty) {
    }
    return (
      <div className="p_list" key={key}>
        <div className="p_list_pp">
          <span>
            <img className="lazy" src="/img/author/author-5.jpg" alt="" />
            <i className="fa fa-check"></i>
          </span>
        </div>

        <div className="p_list_info">
          {timestamp !== GENERAL_TIMESTAMP
            ? "Put on Timed Auction at "
            : "Open for Bids at "}
          <b>
            {price} {paymentTokenData.symbol}
          </b>
          <span>
            by <b>{seller}</b> at {oCreated}
          </span>
          {qty - qtySold}/{nftDetails ? nftDetails.nQuantity : 0}
          <ul className="de_nav">
            <li id="Mainbtn" className="active">
              {timestamp !== GENERAL_TIMESTAMP ? (
                <>
                  Auctions ends in
                  <div className="de_countdown">
                    <Clock deadline={auctionEndDate} />
                  </div>
                </>
              ) : (
                ""
              )}

              <span
                className={
                  new Date(auctionEndDate) < new Date() ? "spn-disabled" : ""
                }
                onClick={() => {
                  setSelectedOrderPaymentTokenData(paymentTokenData);
                  setCurrOrderLeftQty(qty - qtySold);
                  setCurrenOrderMinBid(price);
                  setCurrentOrderId(orderId);
                  setCurrentOrderSeller(sellerId);
                  setIsPlaceABidPopup(true);
                }}
              >
                {new Date(auctionEndDate) >= new Date()
                  ? isUserHaveActiveBid
                    ? "Update Bid"
                    : "Place A Bid"
                  : "Auction Ended"}
              </span>
            </li>
            <li id="Mainbtn">
              <div>
                Payment Token -{" "}
                {paymentTokenData ? paymentTokenData.symbol : ""}{" "}
                {paymentTokenData ? paymentTokenData.name : ""}{" "}
                {paymentTokenData ? convertToEth(paymentTokenData.balance) : ""}{" "}
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const buyNow = (seller, price, orderId, oCreated, key, qtyLeft, qty) => (
    <div className="p_list">
      {loading ? <Loader /> : ""}
      <div className="p_list_pp">
        <span>
          <img className="lazy" src="/img/author/author-5.jpg" alt="" />
          <i className="fa fa-check"></i>
        </span>
      </div>
      <div className="p_list_info">
        Buy Now{" "}
        <b>
          {price} {CURRENCY}
        </b>
        <span>
          by <b>{seller}</b> at {oCreated}
        </span>
        {qtyLeft} / {qty}
        <ul className="de_nav">
          <li id="Mainbtn" className="active">
            <span
              onClick={async () => {
                setLoading(true);

                let bal = new BigNumber(
                  convertToEth(window.sessionStorage.getItem("balance"))
                );
                let payableAmount = new BigNumber(1).multipliedBy(
                  new BigNumber(price)
                );
                if (payableAmount.isGreaterThan(bal)) {
                  NotificationManager.error("Not enough balance");
                  return;
                }
                setCurrentBuyPrice(price);

                nftDetails && nftDetails.nType === 1
                  ? await handleBuyNft(
                      orderId,
                      true,
                      props.account?.account.toLowerCase(),
                      bal,
                      1
                    )
                  : setIsPopup(true);
                setCurrentOrderId(orderId);
                setLoading(false);
              }}
            >
              Buy Now
            </span>
          </li>
        </ul>
      </div>
    </div>
  );

  const NotForSale = (key) => (
    <div className="p_list">
      <ul className="de_nav">
        <li id="Mainbtn" className="active">
          Not For Sale
        </li>
      </ul>
      <div className="p_list_pp">
        <span>
          Created by{" "}
          {nftDetails && nftDetails.nOwnedBy && nftDetails.nOwnedBy.length > 0
            ? nftDetails.nOwnedBy[0].address
            : "0x00.."}
        </span>
      </div>
    </div>
  );

  const PutOnMarketPlace = (qty) => (
    <div className="p_list">
      <div className="p_list_pp">
        <span>
          <img className="lazy" src="/img/author/author-5.jpg" alt="" />
          <i className="fa fa-check"></i>
        </span>
      </div>
      <div className="p_list_info">
        <span>
          Created by{" "}
          {authorDetails && authorDetails.sWalletAddress
            ? authorDetails.sWalletAddress
            : "0x00.."}
        </span>
        {qty}/{nftDetails ? nftDetails.nQuantity : 0}
        <ul className="de_nav">
          <li id="Mainbtn" className="active">
            <span
              onClick={() => {
                toggleMarketplace();
              }}
            >
              Put On Marketplace
            </span>
          </li>
          <li id="Mainbtn" className="active">
            <span
              onClick={() => {
                setIsTransferPopup(true);
              }}
            >
              Transfer NFT
            </span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div>
      <GlobalStyles />
      {isPopup ? modal : ""}
      {isTransferPopup ? transferModal : ""}
      {isPlaceABidPopup ? placeBidModal : ""}
      {isUnlocked ? hiddenContentModal : ""}
      <section className="container">
        {loading ? <Loader /> : ""}
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-6 text-center nft_image_box">
            <img
              src={imageHash ? imageHash : ""}
              className="img-fluid img-rounded explore_item_img_col nft_image mb-sm-30"
              alt=""
            />
          </div>
          <div className="col-md-6">
            <div className="item_info">
              <h2>
                {nftDetails ? nftDetails.nTitle : ""} (
                {nftDetails?.nType === 1 ? "Single" : "Multiple"})
              </h2>
              <div className="item_info_counts">
                <div className="item_info_type">
                  <i className="fa fa-image"></i>Art
                </div>
                <div className="item_info_views">
                  <i className="fa fa-eye"></i>
                  {nftDetails ? nftDetails.nViews : ""}
                </div>
                <div className="item_info_like">
                  <i
                    className="fa fa-heart"
                    onClick={() => {
                      LikeNft({
                        id: nftDetails._id,
                      });
                    }}
                  ></i>
                  {nftDetails ? nftDetails.nLikes : ""}
                </div>
                <div className="item_info_lock">
                  <i
                    className={isUnlocked ? "fa fa-unlock" : "fa fa-lock"}
                    aria-hidden="true"
                    onClick={() => setIsUnlocked(!isUnlocked)}
                  ></i>
                </div>
                <p className="hidden-content-label">Hidden Content</p>
              </div>

              <p>{nftDetails ? nftDetails.nDescription : ""}</p>
              <h6>Creator</h6>
              <div className="item_author">
                <div className="author_list_pp">
                  <span>
                    <img
                      className="lazy"
                      src={
                        authorDetails.sProfilePicUrl
                          ? `${process.env.REACT_APP_IPFS_URL}${authorDetails.sProfilePicUrl}`
                          : "/img/author/author-5.jpg"
                      }
                      alt=""
                    />
                    <i className="fa fa-check"></i>
                  </span>
                </div>
                <div className="author_list_info">
                  <span>{authorDetails ? authorDetails.sUsername : ""}</span>
                </div>
              </div>
              <div className="spacer-40"></div>
              <div className="de_tab">
                <ul className="de_nav">
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

                {isMarketplacePopup ? (
                  <>
                    <PopupModal
                      content={
                        <div className="popup-content1 text-start">
                          <h5>Select method</h5>
                          <div className="de_tab tab_methods">
                            <ul className="de_nav text-center">
                              <li
                                id="btn1"
                                className="active"
                                onClick={handleMpShow}
                              >
                                <span>
                                  <i className="fa fa-tag"></i>Fixed price
                                </span>
                              </li>
                              <li id="btn2" onClick={handleMpShow1}>
                                <span>
                                  <i className="fa fa-hourglass-1"></i>Timed
                                  auction
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
                                <h5>Price</h5>
                                <input
                                  type="Number"
                                  name="item_price"
                                  id="item_price"
                                  value={marketplacePrice}
                                  onChange={(e) => {
                                    setMarketplacePrice(e.target.value);
                                  }}
                                  className="form-control"
                                  placeholder={`enter price for one item (${CURRENCY})`}
                                />
                              </div>

                              <div id="tab_opt_1">
                                <h5>Quantity</h5>
                                <input
                                  type="Number"
                                  name="item_price"
                                  id="item_price"
                                  disabled={nftDetails.nType === 1}
                                  value={marketplaceQuantity}
                                  onChange={(e) => {
                                    setMarketplaceQuantity(e.target.value);
                                  }}
                                  className="form-control"
                                  placeholder={`enter price for one item (${CURRENCY})`}
                                />
                              </div>

                              <div id="tab_opt_2" className="hide">
                                <h5>Minimum bid</h5>
                                <input
                                  type="text"
                                  name="item_price_bid"
                                  id="item_price_bid"
                                  className="form-control"
                                  value={minimumBid}
                                  onChange={(e) => {
                                    setMinimumBid(e.target.value);
                                  }}
                                  placeholder="enter minimum bid"
                                />

                                <div className="spacer-20"></div>

                                <div className="row">
                                  <div className="col-md-6">
                                    <select
                                      onChange={(e) => {
                                        setSelectedTokenAddress(e.target.value);
                                      }}
                                    >
                                      {options
                                        ? options.map((option, key) => {
                                            return (
                                              <option value={option.value}>
                                                {option.title}
                                              </option>
                                            );
                                          })
                                        : ""}
                                    </select>
                                  </div>
                                  <div className="col-md-6">
                                    <h5>Expiration date</h5>
                                    <input
                                      type="date"
                                      name="bid_expiration_date"
                                      id="bid_expiration_date"
                                      min={getMaxAllowedDate()}
                                      onChange={(e) => {
                                        setEndTime(new Date(e.target.value));
                                      }}
                                      className="form-control"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div id="tab_opt_3"></div>
                              <button
                                id="submit"
                                className="btn-main"
                                onClick={async () => {
                                  if (
                                    !props.account ||
                                    !props.account.account
                                  ) {
                                    NotificationManager.error(
                                      "Please reconnect your wallet"
                                    );
                                    return;
                                  }
                                  setLoading(true);
                                  if (
                                    parseInt(marketplaceQuantity) >
                                    parseInt(nftDetails.nQuantity)
                                  ) {
                                    NotificationManager.error(
                                      "Incorrect quantity amount"
                                    );
                                    return;
                                  }
                                  let orderData = {
                                    nftId: nftDetails._id,
                                    collection: nftDetails.nCollection,
                                    price: marketplacePrice,
                                    quantity: marketplaceQuantity,
                                    saleType: marketplaceSaleType,
                                    salt: Math.round(Math.random() * 10000000),
                                    endTime: endTime
                                      ? endTime
                                      : GENERAL_TIMESTAMP,
                                    chosenType: marketplaceSaleType,
                                    minimumBid: minimumBid,
                                    auctionEndDate: endTime
                                      ? endTime
                                      : new Date(GENERAL_DATE),
                                    tokenAddress: selectedTokenAddress,
                                    tokenId: nftDetails.nTokenID,
                                    erc721: nftDetails.nType === 1,
                                  };

                                  await putOnMarketplace(
                                    props.account ? props.account.account : "",
                                    orderData
                                  );
                                  setLoading(false);
                                }}
                              >
                                Put On Marketplace
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                      handleClose={toggleMarketplace}
                    />
                    {loading ? <Loader /> : ""}
                  </>
                ) : (
                  ""
                )}

                <div className="de_tab_content">
                  {openMenu && (
                    <div className="tab-1 onStep fadeIn">
                      {history && history.length > 0
                        ? history.map((h, i) => {
                            return (
                              <div className="p_list">
                                <div className="p_list_pp">
                                  <span>
                                    <img
                                      className="lazy"
                                      src="./img/author/author-5.jpg"
                                      alt=""
                                    />
                                  </span>
                                </div>
                                <div className="p_list_info">
                                  {h.message}
                                  <span> at {h.sCreated}</span>
                                </div>
                              </div>
                            );
                          })
                        : ""}
                    </div>
                  )}

                  {openMenu3 && (
                    <div className="tab-1 onStep fadeIn">
                      <div className="nft_attr">
                        {metaData
                          ? metaData.map((data, key) => {
                              return (
                                <div className="attr">
                                  <div className="attr-item1">
                                    {data.trait_type}
                                  </div>
                                  <div className="attr-item2">{data.value}</div>
                                </div>
                              );
                            })
                          : ""}
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

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    exploreSaleType: state.exploreSaleType,
  };
};

export default connect(mapStateToProps)(ItemDetail);

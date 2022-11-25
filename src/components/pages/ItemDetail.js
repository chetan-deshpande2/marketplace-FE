import React, { useState, useEffect } from "react";
import Clock from "../components/Clock";
import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import { connect } from "react-redux";
import { ethers } from "ethers";

//*==================

import {
  fetchBidNft,
  GetHistory,
  GetIndividualAuthorDetail,
  GetNftDetails,
  GetOrdersByNftId,
  LikeNft,
} from "../../apiServices";
import Loader from "../components/loader";
import {
  createBid,
  handleAcceptBids,
  handleBuyNft,
  handleNftTransfer,
  handleRemoveFromAuction,
  handleUpdateBidStatus,
  handleRemoveFromSale,
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
import {
  getAllBidsByNftId,
  getMaxAllowedDate,
  getPaymentTokenInfo,
  isEmpty,
} from "../../helpers/getterFunctions";

// import "./../components-css/item-detail.css";

const ipfsAPI = require("ipfs-api");
const ipfs = ipfsAPI("ipfs.infura.io", "5001", {
  protocol: "https",
  auth: "21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439",
});
//*================

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`;

const ItemDetail = (props) => {
  const [openMenu, setOpenMenu] = React.useState(true);
  const [openMenu1, setOpenMenu1] = React.useState(false);
  //*==================

  const [openMenu2, setOpenMenu2] = useState(false);
  const [openMenu3, setOpenMenu3] = useState(false);
  const [marketplaceSaleType, setmarketplaceSaleType] = useState(0);
  const [isMarketplacePopup, setMarketplacePopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setcurrentUser] = useState("");
  const [nftDetails, setNftDetails] = useState({});
  const [authorDetails, setAuthorDetails] = useState({});
  const [imageHash, setImageHash] = useState();
  const [metaData, setMetaData] = useState([{}]);
  const [orders, setOrders] = useState([]);
  const [isOwned, setIsOwned] = useState(false);
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
  const [isApproved, setIsApproved] = useState(false);
  const [currentBuyPrice, setCurrentBuyPrice] = useState(0);
  const [currOrderLeftQty, setCurrOrderLeftQty] = useState(0);
  const [currentOrderMinBid, setCurrenOrderMinBid] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [haveOrder, setHaveOrder] = useState(false);

  //*=================

  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
  };
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
    setOpenMenu(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
  };
  const toggleMarketplace = () => {
    setMarketplacePopup(!isMarketplacePopup);
  };

  useEffect(() => {
    console.log(props);
    let id = props.match.params.id;
    async function fetch() {
      if (!localStorage.getItem("Authorization")) return;
      if (id) {
        setLoading(true);
        let data = await GetNftDetails(id);
        console.log("nft details", data);
        let authorData = [];
        if (data)
          authorData = await GetIndividualAuthorDetail({
            userId: data.nCreater,
          });

        setNftDetails(data);
        setAuthorDetails(authorData);
        if (isEmpty(data)) {
          window.location.href = "/profile";
        }

        setLoading(false);
      }
    }
    fetch();
  }, [props.match.params.id, localStorage.getItem("Authorization")]);

  useEffect(() => {
    console.log("propss", props);
    if (props.account && props.account.account)
      setcurrentUser(props.account.account);
  }, [props.account]);

  useEffect(() => {
    const fetch = async () => {
      console.log("nft details11111---------->", nftDetails);
      if (nftDetails && nftDetails.nHash) {
        let res = await ipfs.cat(nftDetails.nHash);
        console.log("res----->>", res);

        setImageHash(JSON.parse(res.toString("utf8")).image);
        // eslint-disable-next-line no-eval
        setMetaData(eval(JSON.parse(res.toString("utf8")).attributes));
      }
    };

    fetch();
  }, [nftDetails]);

  useEffect(() => {
    if (nftDetails && nftDetails.nOwnedBy && currentUser) {
      // eslint-disable-next-line array-callback-return
      let datas = nftDetails.nOwnedBy.filter((data, key) => {
        if (data.address) {
          return data?.address?.toLowerCase() === currentUser.toLowerCase();
        }
      });
      console.log("here", datas);
      if (datas.length >= 1) {
        setIsOwned(true);
        setOwnedQuantity(datas[0].quantity);
      }
    }
  }, [nftDetails, currentUser]);

  useEffect(() => {
    const fetch = async () => {
      console.log("111", nftDetails, currentUser);
      if (nftDetails && currentUser) {
        let searchParams = {
          nftId: nftDetails._id,
          sortKey: "oTokenId",
          sortType: -1,
          page: 1,
          limit: 4,
        };
        console.log("Search Params=====>", searchParams);
        let d = await GetOrdersByNftId(searchParams);
        console.log("ordersLocal", d);

        if (d.results.length < 1) {
          return;
        }
        for (let i = 0; i < d.results?.length; i++) {
          let searchParams = {
            nNFTId: nftDetails._id,
            orderID: d.results[i]._id,
            buyerID: "All",
            bidStatus: "All",
          };
          let _data = await fetchBidNft(searchParams);
          console.log("dattttt", _data);
          if (d.results[i].oPaymentToken !== ZERO_ADDRESS) {
            let paymentData = await getPaymentTokenInfo(
              currentUser,
              d.results[i].oPaymentToken
            );
            paymentData.paymentToken = d.results[i].oPaymentToken;
            console.log("paymentData", paymentData);
            d.results[i].paymentTokenData = paymentData;
          }
          for (let j = 0; j < _data.data?.length; j++) {
            if (
              _data.data[j].oBidder.sWalletAddress.toLowerCase() ===
              currentUser.toLowerCase()
            ) {
              d.results[i].isUserHaveActiveBid = true;
            } else {
              d.results[i].isUserHaveActiveBid = false;
            }
          }
        }
        console.log("setOrders", d.results);
        setOrders(d.results ? d.results : []);
      }
    };
    fetch();
  }, [currentUser, nftDetails]);

  // useEffect(() => {
  //   console.log("filter...", orders);
  //   if (orders.length >= 1 && !isEmpty(orders[0]) && currentUser) {
  //     let datas = orders.filter((data, key) => {
  //       return (
  //         data.oSellerWalletAddress?.toLowerCase() === currentUser.toLowerCase()
  //       );
  //     });
  //     if (datas.length >= 1) {
  //       setHaveOrder(true);
  //     }
  //   }
  // }, [orders, currentUser]);

  // useEffect(() => {
  //   const checkIfOpenForSale = async () => {
  //     for (let i = 0; i < orders.length; i++) {
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
  //     if (nftDetails && nftDetails._id) {
  //       let data = await getAllBidsByNftId(nftDetails._id);
  //       console.log("Bids data", data);
  //       setBids(data);
  //     }
  //   };
  //   fetch();
  // }, [nftDetails]);

  return (
    <div>
      <GlobalStyles />

      <section className="container">
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-6 text-center">
            <img
              src="./img/items/big-1.jpg"
              className="img-fluid img-rounded mb-sm-30"
              alt=""
            />
          </div>
          <div className="col-md-6">
            <div className="item_info">
              Auctions ends in
              <div className="de_countdown">
                <Clock deadline="December, 30, 2021" />
              </div>
              <h2>Pinky Ocean</h2>
              <div className="item_info_counts">
                <div className="item_info_type">
                  <i className="fa fa-image"></i>Art
                </div>
                <div className="item_info_views">
                  <i className="fa fa-eye"></i>250
                </div>
                <div className="item_info_like">
                  <i className="fa fa-heart"></i>18
                </div>
              </div>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </p>
              <h6>Creator</h6>
              <div className="item_author">
                <div className="author_list_pp">
                  <span>
                    <img
                      className="lazy"
                      src="./img/author/author-1.jpg"
                      alt=""
                    />
                    <i className="fa fa-check"></i>
                  </span>
                </div>
                <div className="author_list_info">
                  <span>Monica Lucas</span>
                </div>
              </div>
              <div className="spacer-40"></div>
              <div className="de_tab">
                <ul className="de_nav">
                  <li id="Mainbtn" className="active">
                    <span onClick={handleBtnClick}>Bids</span>
                  </li>
                  <li id="Mainbtn1" className="">
                    <span onClick={handleBtnClick1}>History</span>
                  </li>
                </ul>

                <div className="de_tab_content">
                  {openMenu && (
                    <div className="tab-1 onStep fadeIn">
                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-1.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid accepted <b>0.005 ETH</b>
                          <span>
                            by <b>Monica Lucas</b> at 6/15/2021, 3:20 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-2.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.005 ETH</b>
                          <span>
                            by <b>Mamie Barnett</b> at 6/14/2021, 5:40 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-3.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.004 ETH</b>
                          <span>
                            by <b>Nicholas Daniels</b> at 6/13/2021, 5:03 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-4.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.003 ETH</b>
                          <span>
                            by <b>Lori Hart</b> at 6/12/2021, 12:57 AM
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {openMenu1 && (
                    <div className="tab-2 onStep fadeIn">
                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-5.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.005 ETH</b>
                          <span>
                            by <b>Jimmy Wright</b> at 6/14/2021, 6:40 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-1.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid accepted <b>0.005 ETH</b>
                          <span>
                            by <b>Monica Lucas</b> at 6/15/2021, 3:20 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-2.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.005 ETH</b>
                          <span>
                            by <b>Mamie Barnett</b> at 6/14/2021, 5:40 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-3.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.004 ETH</b>
                          <span>
                            by <b>Nicholas Daniels</b> at 6/13/2021, 5:03 AM
                          </span>
                        </div>
                      </div>

                      <div className="p_list">
                        <div className="p_list_pp">
                          <span>
                            <img
                              className="lazy"
                              src="./img/author/author-4.jpg"
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </span>
                        </div>
                        <div className="p_list_info">
                          Bid <b>0.003 ETH</b>
                          <span>
                            by <b>Lori Hart</b> at 6/12/2021, 12:57 AM
                          </span>
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

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    exploreSaleType: state.exploreSaleType,
  };
};

export default connect(mapStateToProps)(ItemDetail);

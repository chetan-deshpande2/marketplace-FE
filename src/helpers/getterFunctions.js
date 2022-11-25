import {
  exportInstance,
  GetCollectionsByAddress,
  GetCollectionsNftList,
  GetMyCollectionsList,
  GetMyLikedNft,
  GetMyNftList,
  GetMyOnSaleNft,
  GetNftDetails,
  getOrderDetails,
  fetchBidNft,
} from "../apiServices";
import { ethers } from "ethers";
import contracts from "../Config/contracts";
import erc20Abi from "../Config/abis/erc20.json";
import erc721Abi from "./../Config/abis/simpleERC721.json";
import erc1155Abi from "../Config/abis/simpleERC1155.json";

const ipfsAPI = require("ipfs-api");
const ipfs = ipfsAPI("ipfs.infura.io", "5001", {
  protocol: "https",
  auth: "21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439",
});

const toTypedOrder = (
  account,
  tokenAddress,
  id,
  quantity,
  listingType,
  paymentTokenAddress,
  valueToPay,
  deadline,
  bundleTokens,
  bundleTokensQuantity,
  salt
) => {
  const domain = {
    chainId: 80001,
    name: "LN Marketplace",
    verifyingContract: contracts.MARKETPLACE,
    version: "1",
  };
  const types = {
    Order: [
      { name: "user", type: "address" },
      { name: "tokenAddress", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "quantity", type: "uint256" },
      { name: "listingType", type: "uint256" },
      { name: "paymentToken", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "bundleTokens", type: "uint256[]" },
      { name: "bundleTokensQuantity", type: "uint256[]" },
      { name: "salt", type: "uint256" },
    ],
  };

  const value = {
    user: account,
    tokenAddress: tokenAddress,
    tokenId: id,
    quantity: quantity,
    listingType: listingType,
    paymentToken: paymentTokenAddress,
    value: valueToPay,
    deadline: deadline,
    bundleTokens: bundleTokens,
    bundleTokensQuantity: bundleTokensQuantity,
    salt: salt,
  };

  return { domain, types, value };
};

export const readReceipt = async (hash) => {
  try {
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const receipt = await provider.getTransactionReceipt(hash.hash);
    let contractAddress = receipt.logs[0].address;
    return contractAddress;
  } catch (e) {
    console.log("error in api", e);
  }
};
export const GetOwnerOfToken = async (
  collection,
  tokenId,
  isERC721,
  account
) => {
  let collectionInstance = await exportInstance(
    collection,
    isERC721 ? erc721Abi.abi : erc1155Abi.abi
  );
  console.log("collectionInsatnce", collectionInstance);
  let balance = 0;
  if (isERC721) {
    let owner = await collectionInstance.ownerOf(tokenId);
    if (owner.toLowerCase() === account.toLowerCase()) {
      balance = "1";
    }
  } else balance = await collectionInstance.balanceOf(account, tokenId);
  console.log("balance", balance.toString());
  return balance.toString();
};

export const getSignature = async (signer, ...args) => {
  try {
    console.log("111");
    const order = toTypedOrder(...args);
    console.log("order is---->", order);
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("222");
    const signer1 = provider.getSigner();
    console.log("signer1=========>", signer1.address);
    console.log("333");
    console.log(args);
    const signedTypedHash = await signer1._signTypedData(
      order.domain,
      order.types,
      order.value
    );
    console.log("444");
    const sig = ethers.utils.splitSignature(signedTypedHash);
    console.log("555");

    return [sig.v, sig.r, sig.s];
  } catch (e) {
    if (e.code === 4001) {
      console.log("User denied ");
      return false;
    }
    console.log("error in api", e);
    return false;
  }
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};
export const getAllBidsByNftId = async (nftId) => {
  let dummyData = await fetchBidNft({
    nNFTId: nftId,
    orderID: "All",
    buyerID: "All",
    bidStatus: "All",
  });

  let data = [];
  console.log("dummyData---", dummyData);

  dummyData?.data
    ? // eslint-disable-next-line array-callback-return
      dummyData.data.map((d, i) => {
        data.push({
          bidId: d._id,
          bidQuantity: d.oBidQuantity,
          bidPrice: d.oBidPrice.$numberDecimal,
          seller: d.oOwner.sWalletAddress,
          orderId: d.oOrderId,
          bidder: d.oBidder.sWalletAddress,
          bidderProfile: d.oBidder.sProfilePicUrl,
          buyerSignature: d.oBuyerSignature,
          bidderFullName: d.oBidder.oName
            ? d.oBidder.oName.sFirstname
            : d.oBidder
            ? d.oBidder.sWalletAddress
            : "Unnamed",
          nftId: d.oNFTId,
          owner: d.oSeller,
        });
      })
    : data.push([]);

  console.log("dummyData", data);
  return data;
};
export const getMaxAllowedDate = () => {
  var dtToday = new Date();

  var month = dtToday.getMonth() + 1;
  var day = dtToday.getDate();
  var year = dtToday.getFullYear();
  if (month < 10) month = "0" + month.toString();
  if (day < 10) day = "0" + day.toString();

  var maxDate = year + "-" + month + "-" + day;
  return maxDate;
};

export const getPaymentTokenInfo = async (userWallet, tokenAddress) => {
  let token = await exportInstance(tokenAddress, erc20Abi);
  console.log("token is ----->", token);
  let symbol = await token.symbol();
  let name = await token.name();
  let allowance = await token.allowance(userWallet, contracts.MARKETPLACE);
  let balance = await token.balanceOf(userWallet);
  console.log("allowance", allowance.toString());
  return {
    symbol: symbol,
    name: name,
    balance: balance.toString(),
    allowance: allowance.toString(),
  };
};

export const buildSellOrder = async (id) => {
  let details;
  try {
    details = await getOrderDetails({ orderId: id });
    console.log("details 123", details.oPrice?.$numberDecimal);
    const order = [
      details.oSellerWalletAddress,
      details.oTokenAddress,
      details.oTokenId,
      details.oQuantity,
      details.oType,
      details.oPaymentToken,
      details.oPrice ? details.oPrice.$numberDecimal : "0",
      details.oValidUpto,
      details.oBundleTokens,
      details.oBundleTokensQuantities,
      details.oSalt,
    ];

    console.log("getOrder", order);

    return order;
  } catch (e) {
    console.log("error in api", e);
  }
};
export const getNextId = async (collection) => {
  try {
    let details = await GetCollectionsByAddress({
      sContractAddress: collection,
    });
    console.log("details collection", details);
    return details.nextId;
  } catch (e) {
    console.log("error in api", e);
  }
};

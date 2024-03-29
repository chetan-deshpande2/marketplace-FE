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
  getUsersCollections,
  GetOwnedNftList,
  getAllCollections,
  GetHotCollections,
  getUserById,
} from '../apiServices';
import { ethers } from 'ethers';
import Web3 from 'web3';
import contracts from '../Config/contracts';
import erc20Abi from '../Config/abis/erc20.json';
import erc721Abi from './../Config/abis/simpleERC721.json';
import erc1155Abi from '../Config/abis/simpleERC1155.json';
import { GENERAL_DATE, GENERAL_TIMESTAMP, ZERO_ADDRESS } from './constants';
import Avatar from './../assets/react.svg';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { getTokenSymbolByAddress } from './utils';

const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https',
  auth: '21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439',
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
    name: 'LNMarketplace',
    verifyingContract: contracts.MARKETPLACE,
    version: 'V1',
  };
  const types = {
    Order: [
      { name: 'user', type: 'address' },
      { name: 'tokenAddress', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'quantity', type: 'uint256' },
      { name: 'listingType', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'bundleTokens', type: 'uint256[]' },
      { name: 'bundleTokensQuantity', type: 'uint256[]' },
      { name: 'salt', type: 'uint256' },
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
    console.log('error in api', e);
  }
};

export const getBalance = async (account) => {
  let web3 = new Web3(Web3.givenProvider);
  console.log('web3', web3);
  let bal = await web3.eth.getBalance(account);
  console.log('balll', bal);

  return bal.toString();
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
  console.log('collectionInsatnce', collectionInstance);
  let balance = 0;
  if (isERC721) {
    let owner = await collectionInstance.ownerOf(tokenId);
    if (owner.toLowerCase() === account.toLowerCase()) {
      balance = '1';
    }
  } else balance = await collectionInstance.balanceOf(account, tokenId);
  console.log('balance', balance.toString());
  return balance.toString();
};

export const getSignature = async (signer, ...args) => {
  try {
    console.log('args====>', args);
    const order = toTypedOrder(...args);
    console.log('order=>', order);
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    const signedTypedHash = await signer1._signTypedData(
      order.domain,
      order.types,
      order.value
    );
    const sig = ethers.utils.splitSignature(signedTypedHash);

    return [sig.v, sig.r, sig.s];
  } catch (e) {
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
    console.log('error in api', e);
    return false;
  }
};

export const isEmpty = (obj) => {
  console.log(Object.keys(obj).length === 0);
  return Object.keys(obj).length === 0;
};
export const getAllBidsByNftId = async (nftID) => {

  let dummyData = await fetchBidNft({
    nftID: nftID,
    orderID: 'All',
    buyerID: 'All',
    bidStatus: 'All',
  });

  console.log(dummyData.data.length);

  let data = [];
  let highestBid = 0;
  let highestBidData = {};
  let orderPaymentToken = [];
  let getSellerAddress;
  let getBuyerAddress;

  for (let i = 0; i < dummyData?.data?.length; i++) {
    console.log(dummyData.data[i]);
    console.log(dummyData.data[i].oOrderId);
    console.log(dummyData.data[i].oBidder);
    console.log(dummyData.data[i].oOwner);
    let _orderPaymentToken = await getOrderDetails({
      orderId: dummyData.data[i].oOrderId,
    });
    console.log(_orderPaymentToken.oPaymentToken)
    orderPaymentToken.push(_orderPaymentToken.oPaymentToken);

    getSellerAddress = await getUserById({
      sellerId: dummyData.data[i].oBidder,
    });

    getBuyerAddress = await getUserById({
      sellerId: dummyData.data[i].oOwner,
    });

    console.log(getSellerAddress);
    console.log(getBuyerAddress);
  }

  console.log('dummyData---', dummyData.data);
  console.log(getSellerAddress.userAddress);
  console.log(getBuyerAddress.userAddress);

  dummyData?.data
    ? // eslint-disable-next-line array-callback-return
      dummyData.data.map(async (d, i) => {
        console.log(d);
        let paymentSymbol = '';
        if (orderPaymentToken[i] !== ZERO_ADDRESS) {
          paymentSymbol = getTokenSymbolByAddress(orderPaymentToken[i]);
        }
        if (Number(d.oBidPrice.$numberDecimal) > Number(highestBid)) {
          highestBid = Number(d.oBidPrice.$numberDecimal);
          highestBidData = d;
          highestBidData.paymentSymbol = paymentSymbol;
        }

        data.push({
          bidId: d._id,
          bidQuantity: d.oBidQuantity,
          bidPrice: d.oBidPrice.$numberDecimal,
          seller: getBuyerAddress.userAddress,
          orderId: d.oOrderId,
          bidder: getSellerAddress.userAddress,
          bidderProfile: d.oBidder.sProfilePicUrl,
          buyerSignature: d.oBuyerSignature,
          bidderFullName: d.oBidder.oName
            ? d.oBidder.oName.sFirstname
            : d.oBidder
            ? d.oBidder.sWalletAddress
            : 'Unnamed',
          nftId: d.oNFTId,
          owner: d.oSeller,
          oBidDeadline: d.oBidDeadline,
          paymentSymbol: paymentSymbol,
        });
      })
    : data.push([]);
  console.log('dummyData', data);

  return { data: data, highestBid: highestBidData };
};
export const getMaxAllowedDate = () => {
  var dtToday = new Date();

  var month = dtToday.getMonth() + 1;
  var day = dtToday.getDate();
  var year = dtToday.getFullYear();
  if (month < 10) month = '0' + month.toString();
  if (day < 10) day = '0' + day.toString();

  var maxDate = year + '-' + month + '-' + day;
  return maxDate;
};

export const getTokenNameAndSymbolByAddress = async (address) => {
  try {
    if (address === ZERO_ADDRESS) return;
    let token = await exportInstance(address, erc20Abi.abi);
    let symbol = await token.symbol();
    let name = await token.name();
    console.log(symbol, name);

    return {
      symbol: symbol,
      name: name,
    };
  } catch (e) {
    return {
      symbol: '',
      name: '',
    };
  }
};

export const getPaymentTokenInfo = async (userWallet, tokenAddress) => {
  try {
    if (tokenAddress === ZERO_ADDRESS)
      return {
        symbol: '',
        name: '',
      };
    if (userWallet === '') {
      return getTokenNameAndSymbolByAddress(tokenAddress);
    }
    let token = await exportInstance(tokenAddress, erc20Abi.abi);
    let symbol = await token.symbol();
    let name = await token.name();
    console.log(name, symbol);
    let allowance = await token.allowance(userWallet, contracts.MARKETPLACE);
    let balance = await token.balanceOf(userWallet);
    return {
      symbol: symbol,
      name: name,
      balance: balance.toString(),
      allowance: allowance.toString(),
    };
  } catch (e) {
    return {
      symbol: '',
      name: '',
      balance: '',
      allowance: '',
    };
  }
};

export const buildSellOrder = async (id) => {
  let details;
  try {
    details = await getOrderDetails({ orderId: id });
    console.log(details);
    const order = [
      details.oSellerWalletAddress,
      details.oTokenAddress,
      details.oTokenId,
      details.oQuantity,
      details.oType,
      details.oPaymentToken,
      details.oPrice ? details.oPrice.$numberDecimal : '0',
      details.oValidUpto,
      details.oBundleTokens,
      details.oBundleTokensQuantities,
      details.oSalt,
    ];
    console.log(order);

    return order;
  } catch (e) {
    console.log('error in api=====>', e);
  }
};

export const getNextId = async (collection) => {
  try {
    let details = await GetCollectionsByAddress({
      sContractAddress: collection,
    });
    console.log('details collection', details);
    return details.nextId;
  } catch (e) {
    console.log('error in api', e);
  }
};

export const getUsersNFTs = async (
  currPage,
  perPageCount,
  paramType,
  walletAddress,
  userId,
  isAuthor
) => {
  console.log(
    'here',
    'paramType',
    paramType,
    'walletAddress',
    walletAddress,
    'userId',
    userId,
    'isAuthor',
    isAuthor
  );
  let formattedData = [];
  let details = [];
  console.log('walletAddress', walletAddress);
  if (walletAddress === '') {
    return [];
  }
  let searchParams;
  try {
    if (paramType === 0) {
      searchParams = {
        userId: userId,
        sortType: -1,
        sortKey: 'nTitle',
        page: 1,
        limit: 10,
      };
      details = await GetMyOnSaleNft(searchParams);
      console.log(details);
    } else if (paramType === 1) {
      searchParams = {
        page: currPage,
        limit: perPageCount,
        userId: userId,
        searchType: 'createdBy',
      };
      details = await GetOwnedNftList(searchParams);
      console.log(details);
    } else if (paramType === 2) {
      searchParams = {
        userId: userId,
        length: 10,
        start: 0,
      };
      details = await GetMyLikedNft(searchParams);
    } else if (paramType === 3) {
      searchParams = {
        sortType: -1,
        sortKey: 'nTitle',
        page: currPage,
        searchType: 'owned',
        limit: perPageCount,
        userWalletAddress: walletAddress,
      };
      details = await GetOwnedNftList(searchParams);
    }

    let d = [];
    if (details && details.results) {
      let arr = details.results[0];
      console.log(arr);

      if (arr) {
        // for (let i = 0; i < arr.length; i++) {
        //   let resp = await ipfs.cat(arr[i].nHash);
        //   d[i] = JSON.parse(resp.toString("utf8")).image;
        //   console.log("Resp" + resp);
        // }

        console.log('arrr', process.env.REACT_APP_IPFS_URL);
        // eslint-disable-next-line array-callback-return
        arr.map((data, key) => {
          data.previewImg = d[key];
          data.metaData = '#';
          data.metaData = d[key];
          data.deadline =
            data.nOrders?.length > 0
              ? data.nOrders[0].oValidUpto !== GENERAL_TIMESTAMP
                ? data.nOrders[0].oValidUpto
                : ''
              : '';
          data.auction_end_date =
            data.nOrders?.length > 0
              ? data.nOrders[0].auction_end_date !== GENERAL_DATE
                ? data.nOrders[0].auction_end_date
                : ''
              : '';
          data.authorLink = '#';
          data.previewLink = '#';
          data.nftLink = '#';
          data.bidLink = '#';
          data.authorImg =
            data.nCreater && data.nCreater.sProfilePicUrl
              ? process.env.REACT_APP_IPFS_URL + data.nCreater.sProfilePicUrl
              : '';
          data.title = data ? data.nTitle : '';
          data.price = '';
          data.bid = '';
          data.likes = data.nUser_likes?.length;
          data.id = data ? data._id : '';
          formattedData.push(data);
        });
      }
    }
    console.log('formattedData', formattedData);
    return formattedData;
  } catch (e) {
    console.log('error in api', e);
  }
};

export const getUsersTokenBalance = async (account, tokenAddress) => {
  console.log(account, tokenAddress);
  let addressofToken;
  addressofToken = await exportInstance(tokenAddress, erc20Abi.abi);
  console.log(addressofToken);
  let userBalance = await addressofToken.balanceOf(account);
  console.log(
    'token',
    addressofToken,
    'userBalance',
    userBalance.toString(),
    account
  );
  return userBalance.toString();
};

export const checkIfCollectionNameAlreadyTaken = async (collName) => {
  try {
    let collections = await getAllCollections();
    collections = collections.filter((col) => col.sName === collName);
    if (collections.length > 0) return true;
    else return false;
  } catch (e) {
    console.log('error', e);
    return;
  }
};

export const getCollections = async (
  currPage,
  perPageCount,
  userId,
  isAllCollections = false,
  ERC721 = '',
  searchedData = ''
) => {
  try {
    let result = [];
    let reqParams = { page: currPage, limit: perPageCount, userId: userId };

    let formattedData = [];
    if (isAllCollections) {
      reqParams = {
        page: currPage,
        limit: perPageCount,
        erc721: ERC721,
        sTextsearch: searchedData,
        sortType: -1,
      };
      result = await GetHotCollections(reqParams);
      console.log(GetHotCollections);
      if (!result) return [];
    } else {
      result = await getUsersCollections(reqParams);
      if (!result) return [];
    }
    let arr = result.results;
    arr
      ? arr.map((data, key) => {
          return formattedData.push({
            collectionImage: data.collectionImage
              ? data.collectionImage
              : './img/author/author-7.jpg',
            authorImage:
              data.oUser.length > 0
                ? data.oUser[0].sProfilePicUrl
                  ? data.oUser[0].sProfilePicUrl
                  : Avatar
                : Avatar,
            collectionName: data.sName,
            collectionType: data.erc721 ? 'ERC721' : 'ERC1155',
            collectionAddress: data.sContractAddress,
            createdBy: data.sCreatedBy,
            authorId: data.oUser.length > 0 ? data.oUser[0]._id : '',
            count: result.count,
            authorAddress:
              data.oUser.length > 0 ? data.oUser[0].sWalletAddress : '',
          });
        })
      : formattedData.push([]);

    return formattedData;
  } catch (e) {
    console.log('error in api', e);
  }
};

export const checkIfLiked = async (nftId, authorId) => {
  let nftDetails = await GetNftDetails(nftId);
  let data = nftDetails?.nUser_likes?.filter((d) => {
    return d === authorId;
  });
  return data?.length > 0;
};

import { BigNumber } from 'big-number';
import { ethers } from 'ethers';
import { NotificationManager } from 'react-notifications';
import { GENERAL_DATE, GENERAL_TIMESTAMP, MAX_ALLOWANCE_AMOUNT } from './constants';

import {
  exportInstance,
  getOrderDetails,
  UpdateOrderStatus,
  DeleteOrder,
  InsertHistory,
  createCollection,
  createOrder,
  TransferNfts,
  createBidNft,
  updateBidNft,
  acceptBid,
} from '../apiServices';
import {
  GetOwnerOfToken,
  getPaymentTokenInfo,
  getUsersTokenBalance,
  isEmpty,
  readReceipt,
  buildSellOrder,
  getNextId,
  getSignature,
} from './getterFunctions';
import { convertToEth } from './numberFormatter';
import { slowRefresh } from './NotifyStatus';
import contracts from '../Config/contracts';

import erc721Abi from '../Config/abis/simpleERC721.json';
import erc1155Abi from '../Config/abis/simpleERC1155.json';
import marketPlaceABI from '../Config/abis/marketplace.json';
import Creator1 from '../Config/abis/creatorV1.json';
import erc20Abi from '../Config/abis/erc20.json';

export const handleCollectionCreation = async (isSingle, collectionData, account) => {
  console.log('collection data', collectionData);

  let creator = await exportInstance('0x00e8938EFb57A1A135c4f6fDBCee6CF9E64777c8', Creator1.abi);
  console.log(creator);
  let res1;
  let contractAddress;
  let fd;
  console.log(collectionData);
  try {
    if (isSingle)
      res1 = await creator.deploySimpleERC721(
        collectionData.sName,
        collectionData.symbol,
        collectionData.nftFile,
        collectionData.sRoyaltyPercentage,
      );
    else {
      res1 = await creator.deploySimpleERC1155(collectionData.nftFile, collectionData.sRoyaltyPercentage);
    }

    let hash = res1;
    res1 = await res1.wait();
    console.log('Conttract deployed sucessfully', res1.status);
    if (res1.status === 0) {
      NotificationManager.error('Transaction failed');
      console.log('Transaction Failed S');
      return;
    }
    contractAddress = await readReceipt(hash);
    console.log('contract receipt', contractAddress);
    let royalty = await exportInstance(contractAddress, isSingle ? erc721Abi.abi : erc1155Abi.abi);
    console.log('account detail', account, collectionData.sRoyaltyPercentage);

    let res = await royalty.setDefaultRoyaltyDistribution([account], [collectionData.sRoyaltyPercentage]);
    res = await res.wait();
    console.log(collectionData.sName);
    console.log(collectionData.sDescription);
    console.log('==========', collectionData.nftFile);
    if (res.status === 0) {
      // NotificationManager.error("Transaction failed");
      console.log('Transaction Failed B');
      return;
    }

    if (res1.status === 1) {
      console.log('nftFile======>', collectionData.nftFile);
      fd = new FormData();

      fd.append('sName', collectionData.sName);
      fd.append('sDescription', collectionData.sDescription);
      fd.append('nftFile', collectionData.nftFile);
      fd.append('sContractAddress', contractAddress);
      fd.append('erc721', isSingle ? JSON.stringify(true) : JSON.stringify(false));
      fd.append('sRoyaltyPercentage', collectionData.sRoyaltyPercentage);
      fd.append('quantity', collectionData.quantity);
    }
    await createCollection(fd);
    console.log(await createCollection(fd));

    console.log('Collection Created Successfully');
    return true;
  } catch (e) {
    console.log('Transaction Failed A');
    NotificationManager.error('Transaction Failed A');

    console.log('error in contract function call', e);
    if (e.code === 401) {
      // NotificationManager.error("User denied ");
      console.log('User Denied');
      return false;
    }
  }
};

export const handleBuyNft = async (id, isERC721, account, balance, qty = 1) => {
  let order;
  let details;
  let status;
  let marketplace;
  try {
    order = await buildSellOrder(id);
    details = await getOrderDetails({ orderId: id });
    status = 1;
    console.log('order and details are', order, qty);
  } catch (e) {
    console.log('error in API', e);
    return;
  }

  let sellerOrder = [];
  let buyerOrder = [];
  console.log('details.signature', details.oSignature);
  let amount = new BigNumber(order[6].toString()).multipliedBy(new BigNumber(qty.toString())).toString();
  console.log(
    'price',
    new BigNumber(order[6].toString()).multipliedBy(new BigNumber(order[3].toString())).toString(),
    isERC721,
  );
  for (let key = 0; key < 11; key++) {
    switch (key) {
      case 0:
        if (isERC721) {
          sellerOrder.push(order[key]);
          buyerOrder.push(account);
          break;
        } else {
          sellerOrder.push(order[key]);
          buyerOrder.push(account);
          break;
        }
      case 1:
        sellerOrder.push(order[key]);
        buyerOrder.push(order[key]);
        break;
      case 3:
        if (isERC721) {
          sellerOrder.push(order[key]);
          buyerOrder.push(order[key]);
        } else {
          sellerOrder.push(order[key]);
          buyerOrder.push(Number(qty));
        }

        break;
      case 5:
        sellerOrder.push(order[key]);
        buyerOrder.push(order[key]);
        break;
      case 6:
        if (isERC721) {
          sellerOrder.push(order[key]);
          buyerOrder.push(order[key]);
        } else {
          buyerOrder.push(amount);
          sellerOrder.push(order[key]);
        }

        break;
      case 8:
        sellerOrder.push([]);
        buyerOrder.push([]);
        break;
      case 9:
        sellerOrder.push([]);
        buyerOrder.push([]);
        break;
      default:
        sellerOrder.push(parseInt(order[key]));
        buyerOrder.push(parseInt(order[key]));
    }
  }

  console.log(
    'order data---->:',
    'nftId',
    details.oNftId,
    'qty',
    qty,
    'buyer',
    account,
    'seller',
    details.oSellerWalletAddress,
  );

  console.log('seller and buyer order is', sellerOrder, buyerOrder);

  // check if seller still owns that much quantity of current token id
  // check if seller still have approval for marketplace
  // check if buyer have sufficient matic or not (fixed sale)
  let usrHaveQuantity = await GetOwnerOfToken(sellerOrder[1], sellerOrder[2], isERC721, sellerOrder[0]);

  let NFTcontract = await exportInstance(sellerOrder[1], isERC721 ? erc721Abi.abi : erc1155Abi.abi);
  console.log('NFTcontract', NFTcontract, sellerOrder[0], contracts.MARKETPLACE);

  let approval = await NFTcontract.isApprovedForAll(sellerOrder[0], contracts.MARKETPLACE);

  console.log('usrHaveQuantity', usrHaveQuantity);
  // if (Number(usrHaveQuantity) < Number(qty)) {
  //   NotificationManager.error("Seller don't own that much quantity");
  //   return;
  // }

  if (!approval) {
    NotificationManager.error("Seller didn't approved marketplace");
    return;
  }

  if (
    new BigNumber(balance.toString()).isLessThan(
      new BigNumber(order[6].toString()).multipliedBy(new BigNumber(qty.toString())),
    )
  ) {
    NotificationManager.error("buyer don't have enough Matic");
    return;
  }

  let signature = details.oSignature;
  const options = {
    from: account,
    gasLimit: 9000000,
    value: new BigNumber(order[6].toString()).multipliedBy(new BigNumber(qty.toString())).toString(),
  };

  try {
    marketplace = await exportInstance(contracts.MARKETPLACE, marketPlaceABI.abi);

    console.log('Sit tight->', signature);
    let completeOrder = await marketplace.completeOrder(sellerOrder, signature, buyerOrder, signature, options);
    let res = await completeOrder.wait();
    if (res.status === 0) {
      NotificationManager.error('Transaction failed');
      console.log();
      return;
    }
    console.log('res', res);
    console.log('order completed is ---->', completeOrder);
  } catch (e) {
    console.log('error in contract function calling', e);
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
    return;
  }

  try {
    if (isERC721) {
      await UpdateOrderStatus({
        orderId: id,
        oStatus: status,
        oNftId: details.oNftId, //to make sure we update the quantity left : NFTid
        oSeller: details.oSellerWalletAddress.toLowerCase(), //to make sure we update the quantity left : walletAddress
        oQtyBought: Number(qty),
        qty_sold: Number(details.quantity_sold) + Number(qty),
        oBuyer: account.toLowerCase(),
      });
      let historyMetaData = {
        nftId: '62428d42f2a67d12e95d3c3c',
        userId: '62318683b799e41d5608fb67',
        action: 'Bids',
        actionMeta: 'Default',
        message: 'UserName Created NFT',
      };
      DeleteOrder({ orderId: id }, historyMetaData);
    } else {
      await UpdateOrderStatus({
        orderId: id,
        oStatus: status,
        oNftId: details.oNftId, //to make sure we update the quantity left : NFTid
        oSeller: details.oSellerWalletAddress.toLowerCase(), //to make sure we update the quantity left : walletAddress
        oQtyBought: Number(qty),
        qty_sold: Number(details.quantity_sold) + Number(qty),
        oBuyer: account.toLowerCase(),
      });
      let historyMetaData = {
        nftId: '62428d42f2a67d12e95d3c3c',
        userId: '62318683b799e41d5608fb67',
        action: 'Bids',
        actionMeta: 'Default',
        message: 'UserName Created NFT',
      };
      if (Number(details.quantity_sold) + Number(qty) >= details.oQuantity) {
        DeleteOrder({ orderId: id }, historyMetaData);
      }
    }
  } catch (e) {
    console.log('error in updating order data', e);
    return;
  }

  NotificationManager.success('NFT Purchased Successfully');
  slowRefresh();
};

export const putOnMarketplace = async (account, orderData) => {
  console.log('Starting NFT create', account, orderData);
  if (!account) {
    console.log('empty account');
    return;
  }
  let nextId = await getNextId(orderData.collection);
  console.log('nextId', nextId, orderData.collection);
  let _deadline;
  let _price;
  let _auctionEndDate;
  let sellerOrder;
  try {
    if (orderData.chosenType === 0) {
      _deadline = GENERAL_TIMESTAMP;
      _auctionEndDate = new Date(GENERAL_DATE);
      _price = ethers.utils.parseEther(orderData.price).toString();
    } else if (orderData.chosenType === 1) {
      let endTime = new Date(orderData.endTime).valueOf() / 1000;
      _deadline = endTime;
      _auctionEndDate = orderData.auctionEndDate;
      _price = ethers.utils.parseEther(orderData.minimumBid).toString();
    } else if (orderData.chosenType === 2) {
      _deadline = new Date().valueOf() / 1000 + 31536000 * 10;
      _auctionEndDate = new Date(GENERAL_DATE);
      _price = ethers.utils.parseEther(orderData.minimumBid).toString();
    }
    sellerOrder = [
      account,
      orderData.collection,
      orderData.tokenId,
      orderData.quantity,
      orderData.saleType,
      orderData.tokenAddress ? orderData.tokenAddress : '0x0000000000000000000000000000000000000000',
      _price,
      _deadline,
      [],
      [],
      orderData.salt,
    ];

    let usrHaveQuantity = await GetOwnerOfToken(sellerOrder[1], sellerOrder[2], orderData.erc721, sellerOrder[0]);

    console.log('usrHaveQuantity', usrHaveQuantity);
    console.log('sellerOrder is---->', sellerOrder);
    let NFTcontract = await exportInstance(orderData.collection, erc721Abi.abi);
    console.log('NFTcontract', NFTcontract);

    let approval = await NFTcontract.isApprovedForAll(account, contracts.MARKETPLACE);
    let approvalres;
    const options = {
      from: account,
      gasPrice: 10000000000,
      gasLimit: 9000000,
      value: 0,
    };

    console.log('approval', approval);
    if (!approval) {
      approvalres = await NFTcontract.setApprovalForAll(contracts.MARKETPLACE, true, options);
      approvalres = await approvalres.wait();
      if (approvalres.status === 0) {
        NotificationManager.error('Transaction failed');
        return false;
      }
    }
  } catch (e) {
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
    console.log('error in contract', e);
    NotificationManager.error('Transaction failed');
    return false;
  }
  try {
    let signature = [];

    signature = await getSignature(account, ...sellerOrder);
    if (signature === false) {
      return;
    }

    console.log('signature is---->', signature);

    let reqParams = {
      nftId: orderData.nftId,
      seller: account,
      tokenAddress: orderData.tokenAddress ? orderData.tokenAddress : '0x0000000000000000000000000000000000000000',
      collection: orderData.collection,
      price: _price,
      quantity: orderData.quantity,
      saleType: orderData.saleType,
      validUpto: _deadline,
      signature: signature,
      tokenId: orderData.tokenId,
      auctionEndDate: _auctionEndDate,
      salt: orderData.salt,
    };

    let historyMetaData = {
      nftId: '62428d42f2a67d12e95d3c3c',
      userId: '62318683b799e41d5608fb67',
      action: 'Bids',
      actionMeta: 'Default',
      message: 'UserName Created NFT',
    };
    let data = await createOrder(reqParams, historyMetaData);
    console.log('put on sale', data);

    console.log('seller sign', reqParams);

    NotificationManager.success('Order created successfully');
    slowRefresh();
    // window.location.href = "/profile";
  } catch (err) {
    console.log('error in Api', err);
    return;
  }
};

export const handleUpdateBidStatus = async (
  bidID,
  action, //Delete, Cancelled, Rejected
) => {
  console.log('payload', bidID, action);

  try {
    let reqParams = {
      bidID: bidID,
      action: action, //Delete, Cancelled, Rejected
    };
    let res = await updateBidNft(reqParams);
    console.log('resss', res);

    NotificationManager.success(`Bid ${action} Successfully`);
    slowRefresh();
  } catch (e) {
    console.log('error in api', e);
  }
};

export const handleRemoveFromAuction = async (orderId, account) => {
  let marketplace;
  try {
    marketplace = await exportInstance(contracts.MARKETPLACE, marketPlaceABI.abi);
    const options = {
      from: account,
      gasLimit: 9000000,
      value: '0',
    };
    let order = await buildSellOrder(orderId);
    let details = await getOrderDetails({ orderId: orderId });
    console.log('order and details are', order, details);

    console.log('details.signature', details.oSignature);
    let res = await marketplace.cancelOrder(order, details.oSignature, options);
    await res.wait();
    if (res.status === 0) {
      NotificationManager.error('Transaction failed');
      return;
    }
    let historyMetaData = {
      nftId: '62428d42f2a67d12e95d3c3c',
      userId: '62318683b799e41d5608fb67',
      action: 'Bids',
      actionMeta: 'Default',
      message: 'UserName Created NFT',
    };
    await DeleteOrder(
      {
        orderId: orderId,
        oNftId: details.oNftId,
      },
      historyMetaData,
    );
    NotificationManager.success('Removed from Auction successfully');
    slowRefresh();
  } catch (e) {
    console.log('error in contract function call', e);
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
  }
  // window.location.href = "/profile";

  // console.log("res", res);
};

export const handleNftTransfer = async (collection, account, beneficiary, amount, tokenId, isERC721, nftId) => {
  console.log('here');
  try {
    let nftContract;
    let res;
    const options = {
      from: account,
      gasLimit: 9000000,
      value: '0',
    };
    if (isERC721) {
      nftContract = await exportInstance(collection, erc721Abi.abi);
      res = await nftContract.transferFrom(account, beneficiary, tokenId, options);
    } else {
      nftContract = await exportInstance(collection, erc1155Abi.abi);
      console.log('nft contract', nftContract, account, beneficiary, tokenId, amount);
      res = await nftContract.safeTransferFrom(account, beneficiary, tokenId, amount, [], options);
    }

    console.log('nft contract', nftContract);

    console.log('res', res);
    res = await res.wait();
    if (res.status === 0) {
      NotificationManager.error('Transaction failed');
      slowRefresh();
      return;
    }
    console.log('Response', res);
  } catch (e) {
    console.log('error in contract interaction', e);
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
  }

  try {
    let reqParams = {
      nftId: nftId,
      sender: account,
      receiver: beneficiary,
      qty: amount,
    };
    await TransferNfts(reqParams);
    slowRefresh();

    // window.location.reload();
  } catch (e) {
    console.log('error in api', e);
  }
};

export const handleRemoveFromSale = async (orderId, account) => {
  let marketplace;
  let order;
  let details;
  try {
    marketplace = await exportInstance(contracts.MARKETPLACE, marketPlaceABI.abi);
    const options = {
      from: account,
      gasLimit: 9000000,
      value: '0',
    };
    order = await buildSellOrder(orderId);
    details = await getOrderDetails({ orderId: orderId });
    console.log('order and details are', order, details);

    console.log('details.signature', details.oSignature);
    let res = await marketplace.cancelOrder(order, details.oSignature, options);
    res = await res.wait();
    if (res.status === 0) {
      NotificationManager.error('Transaction failed');
      return;
    }
  } catch (e) {
    console.log('error in contract function call', e);
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
  }
  try {
    let historyMetaData = {
      nftId: '62428d42f2a67d12e95d3c3c',
      userId: '62318683b799e41d5608fb67',
      action: 'Bids',
      actionMeta: 'Default',
      message: 'UserName Created NFT',
    };
    await DeleteOrder(
      {
        orderId: orderId,
        oNftId: details.oNftId,
      },
      historyMetaData,
    );
    NotificationManager.success('Removed from sale successfully');
    // window.location.href = "/profile";
    // window.location.reload();
    // console.log("res", res);
  } catch (e) {
    console.log('error while updating database', e);
  }
};

export const createBid = async (nftID, orderID, ownerAccount, buyerAccount, erc721, qty = 1, bidPrice) => {
  console.log('payload', nftID, orderID, ownerAccount, buyerAccount, erc721, qty, bidPrice);
  let SellerOrder;
  let sellerOrder = [];
  let buyerOrder = [];
  try {
    SellerOrder = await buildSellOrder(orderID);
    for (let index = 0; index < 11; index++) {
      switch (index) {
        case 0:
          sellerOrder.push(SellerOrder[index]);
          buyerOrder.push(buyerAccount);
          break;
        case 1:
          sellerOrder.push(SellerOrder[index]);
          buyerOrder.push(SellerOrder[index]);
          break;
        case 3:
          sellerOrder.push(SellerOrder[index]);
          console.log('bid nQuantity', Number(qty));
          buyerOrder.push(Number(qty));
          break;
        case 5:
          sellerOrder.push(SellerOrder[index]);
          buyerOrder.push(SellerOrder[index]);
          break;
        case 6:
          sellerOrder.push(SellerOrder[index]);
          buyerOrder.push(
            new BigNumber(ethers.utils.parseEther(bidPrice.toString()).toString())
              .multipliedBy(new BigNumber(qty.toString()))
              .toString(),
          );

          break;
        case 8:
          sellerOrder.push([]);
          buyerOrder.push([]);
          break;
        case 9:
          sellerOrder.push([]);
          buyerOrder.push([]);
          break;
        default:
          sellerOrder.push(parseInt(SellerOrder[index]));
          buyerOrder.push(parseInt(SellerOrder[index]));
      }
    }
    console.log('seller order and buyer order', sellerOrder, '----', buyerOrder, buyerAccount);

    try {
      let allowance = (await getPaymentTokenInfo(buyerAccount, sellerOrder[5])).allowance.toString();
      console.log(
        'allowance',
        new BigNumber(allowance).isLessThan(
          new BigNumber(ethers.utils.parseEther(bidPrice.toString()).toString())
            .multipliedBy(new BigNumber(qty.toString()))
            .toString(),
        ),
      );
      let userTokenBal = await getUsersTokenBalance(buyerOrder[0], buyerOrder[5]);

      let usrHaveQuantity = await GetOwnerOfToken(sellerOrder[1], sellerOrder[2], erc721, sellerOrder[0]);

      console.log('usrHaveQuantity', usrHaveQuantity);

      console.log(
        'token balance',
        new BigNumber(bidPrice).multipliedBy(new BigNumber(qty.toString())).toString(),
        new BigNumber(convertToEth(userTokenBal)).toString(),
      );
      if (
        new BigNumber(bidPrice).multipliedBy(new BigNumber(qty.toString())).isGreaterThan(new BigNumber(userTokenBal))
      ) {
        NotificationManager.error("User don't have sufficient token balance");
        return;
      }

      if (
        new BigNumber(allowance).isLessThan(
          new BigNumber(ethers.utils.parseEther(bidPrice.toString()).toString())
            .multipliedBy(new BigNumber(qty.toString()))
            .toString(),
        )
      ) {
        console.log('hereeee');
        let approvalRes = await handleApproveToken(buyerOrder[0], buyerOrder[5]);
        if (approvalRes === false) return;
      }

      let signature = await getSignature(buyerAccount, ...buyerOrder);
      if (signature === false) return;
      if (signature) {
        let reqParams = {
          oOwner: ownerAccount,
          oBidStatus: 'Bid',
          oBidPrice: ethers.utils.parseEther(bidPrice.toString()).toString(),
          oNFTId: nftID,
          oOrderId: orderID,
          oBidQuantity: Number(qty),
          oBuyerSignature: signature,
        };
        console.log('buyer signature', signature);
        await createBidNft(reqParams);
        NotificationManager.success('Bid Placed Successfully');
        slowRefresh();
      }

      // window.location.reload();
    } catch (e) {
      console.log('error in api', e);
      return;
    }
  } catch (e) {
    console.log('error in api', e);
    return;
  }
};

export const handleApproveToken = async (userAddress, tokenAddress) => {
  try {
    let token = await exportInstance(tokenAddress, erc20Abi);
    const options = {
      from: userAddress,
      gasLimit: 9000000,
      value: 0,
    };
    let res = await token.approve(contracts.MARKETPLACE, MAX_ALLOWANCE_AMOUNT, options);
    res = await res.wait();
    console.log(res);
    if (res.status === 1) {
      NotificationManager.success('Approved');
      // window.location.reload();
      return res;
    }
  } catch (e) {
    console.log('error in contract function calling', e);
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
  }
};

export const handleAcceptBids = async (bidData, isERC721, bidderUserName, nftTitle) => {
  console.log('payload', bidData.bidID, isERC721);
  let order;
  let details;

  try {
    order = await buildSellOrder(bidData.orderId);
    details = await getOrderDetails({ orderId: bidData.orderId });

    console.log('order and details are', order, bidData.bidQuantity);
  } catch (e) {
    console.log('error in API', e);
    return;
  }
  let buyerOrder = [];
  let sellerOrder = [];
  console.log('details.signature', details.oSignature);
  let amount = new BigNumber(bidData.bidPrice.toString())
    .multipliedBy(new BigNumber(bidData.bidQuantity.toString()))
    .toString();

  for (let key = 0; key < 11; key++) {
    switch (key) {
      case 0:
        sellerOrder.push(order[key]);
        buyerOrder.push(bidData.bidder);
        break;

      case 1:
        sellerOrder.push(order[key]);
        buyerOrder.push(order[key]);
        break;
      case 3:
        if (isERC721) {
          sellerOrder.push(order[key]);
          buyerOrder.push(order[key]);
        } else {
          sellerOrder.push(order[key]);
          buyerOrder.push(Number(bidData.bidQuantity));
        }

        break;
      case 5:
        sellerOrder.push(order[key]);
        buyerOrder.push(order[key]);
        break;
      case 6:
        buyerOrder.push(amount);
        sellerOrder.push(order[key]);

        break;
      case 8:
        sellerOrder.push([]);
        buyerOrder.push([]);
        break;
      case 9:
        sellerOrder.push([]);
        buyerOrder.push([]);
        break;
      default:
        sellerOrder.push(parseInt(parseInt(order[key])));
        buyerOrder.push(parseInt(parseInt(order[key])));
    }
  }

  console.log('seller and buyer order is', sellerOrder, buyerOrder);

  let sellerSignature = details.oSignature;
  let buyerSignature = bidData.buyerSignature;
  const options = {
    from: bidData.seller,
    gasLimit: 9000000,
    value: '0',
  };
  // console.log("Signature", sellerSignature, buyerSignature);

  let balance = await getUsersTokenBalance(bidData.bidder, details.oPaymentToken);
  console.log('dddd', Number(convertToEth(balance)), Number(convertToEth(buyerOrder[6])));

  let usrHaveQuantity = await GetOwnerOfToken(sellerOrder[1], sellerOrder[2], isERC721, sellerOrder[0]);

  let NFTcontract = await exportInstance(sellerOrder[1], isERC721 ? erc721Abi.abi : erc1155Abi.abi);

  console.log('NFTcontract', NFTcontract, sellerOrder[0], contracts.MARKETPLACE);

  let approval = await NFTcontract.isApprovedForAll(sellerOrder[0], contracts.MARKETPLACE);

  console.log('usrHaveQuantity', usrHaveQuantity);
  if (Number(usrHaveQuantity) < Number(buyerOrder[3])) {
    NotificationManager.error("Seller don't own that much quantity");
    return;
  }

  if (!approval) {
    NotificationManager.error("Seller didn't approved marketplace");
    return;
  }

  let paymentTokenData = await getPaymentTokenInfo(buyerOrder[0], buyerOrder[5]);
  console.log('paymentTokenData', paymentTokenData);

  if (
    new BigNumber(paymentTokenData.balance).isLessThan(
      new BigNumber(order[6].toString()).multipliedBy(new BigNumber(buyerOrder[3].toString())),
    )
  ) {
    NotificationManager.error("buyer don't have enough Tokens");
    return;
  }
  console.log('sellerSignature', sellerSignature, 'buyerSignature', buyerSignature);
  try {
    let marketplace = await exportInstance(contracts.MARKETPLACE, marketPlaceABI.abi);
    // console.log("Sit tight->");
    let completeOrder;
    try {
      completeOrder = await marketplace.completeOrder(
        sellerOrder,
        sellerSignature,
        buyerOrder,
        buyerSignature,
        options,
      );
      completeOrder = await completeOrder.wait();
      if (completeOrder.status === 0) {
        NotificationManager.error('Transaction Failed');
        return;
      } else {
        NotificationManager.success('Transaction successful');
      }
    } catch (e) {
      console.log('error in contract', e);
      return;
    }
    try {
      let reqParams = {
        bidID: bidData.bidId,
        erc721: isERC721,
        status: isERC721 ? 2 : 1,
        qty_sold: details.quantity_sold + bidData.bidQuantity,
      };
      console.log('reqParams', reqParams);

      let res = await acceptBid(reqParams);
      try {
        let historyMetaData = {
          nftId: bidData.nftId,
          userId: bidData.owner,
          action: 'Bids',
          actionMeta: 'Default',
          message: `${bidderUserName} accepted bid for ${nftTitle}`,
        };

        await InsertHistory(historyMetaData);
      } catch (e) {
        console.log('error in history api', e);
        return;
      }
      console.log('res', res);
      // window.location.reload();
    } catch (e) {
      console.log('error in api', e);
      return;
    }
    console.log('order completed is ---->', completeOrder);
  } catch (e) {
    console.log('error in contract function calling', e);
    if (e.code === 4001) {
      NotificationManager.error('User denied ');
      return false;
    }
    return false;
  }
  NotificationManager.success('Bid Accepted Successfully');
  slowRefresh();
};

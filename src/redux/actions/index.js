import {
  ACCOUNT_UPDATE,
  TOKEN_UPDATE,
  WEB3_LOADED,
  ACCOUNT_UPDATE_ON_DISCONNECT,
  EXPLORE_SALE_TYPE_UPDATE,
  NFT_LIST_PARAMS_UPDATE,
  PROFILE_DATA_LOADED,
  AUTHOR_DATA_LOADED,
} from "../constants/action-types";

export function accountUpdate(payload) {
  return { type: ACCOUNT_UPDATE, payload };
}

export function exploreSaleTypeUpdated(payload) {
  return { type: EXPLORE_SALE_TYPE_UPDATE, payload };
}

export function tokenUpdate(payload) {
  return { type: TOKEN_UPDATE, payload };
}

export function web3Loaded(payload) {
  return { type: WEB3_LOADED, payload };
}

export function accountUpdateOnDisconnect() {
  localStorage.removeItem("selected_account");
  return { type: ACCOUNT_UPDATE_ON_DISCONNECT };
}

export function nftListParamsUpdate(payload) {
  return { type: NFT_LIST_PARAMS_UPDATE, payload };
}

export function userProfileDataLoaded(payload) {
  return { type: PROFILE_DATA_LOADED, payload };
}

export function authorDataLoaded(payload) {
  return { type: AUTHOR_DATA_LOADED, payload };
}

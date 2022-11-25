import {
  ACCOUNT_UPDATE,
  WEB3_LOADED,
  ACCOUNT_UPDATE_ON_DISCONNECT,
  TOKEN_UPDATE,
  EXPLORE_SALE_TYPE_UPDATE,
  NFT_LIST_PARAMS_UPDATE,
  PROFILE_DATA_LOADED,
  AUTHOR_DATA_LOADED,
} from "../constants/action-types";

const initialState = {
  account: null,
  web3: null,
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case ACCOUNT_UPDATE:
      return Object.assign({}, state, {
        account: action.payload,
      });
    case WEB3_LOADED:
      return Object.assign({}, state, {
        web3: action.payload,
      });
    case ACCOUNT_UPDATE_ON_DISCONNECT:
      return Object.assign({}, state, {
        account: null,
      });
    case TOKEN_UPDATE:
      return Object.assign({}, state, {
        token: action.payload,
      });
    case EXPLORE_SALE_TYPE_UPDATE:
      return Object.assign({}, state, {
        exploreSaleType: action.payload,
      });
    case NFT_LIST_PARAMS_UPDATE:
      return Object.assign({}, state, {
        paramType: action.payload,
      });
    case PROFILE_DATA_LOADED:
      return Object.assign({}, state, {
        profileData: action.payload,
      });
    case AUTHOR_DATA_LOADED:
      return Object.assign({}, state, {
        authorData: action.payload,
      });
    default: {
      return state;
    }
  }
}

export default rootReducer;

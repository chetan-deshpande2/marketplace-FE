import { ethers } from "ethers";
import contracts from "../Config/contracts";

export const GENERAL_TIMESTAMP = 2214189165;
export const GENERAL_DATE = "01/03/2040";
export const CURRENCY = "MATIC";
export const MAX_ALLOWANCE_AMOUNT = ethers.constants.MaxInt256;
export const options = [{ value: contracts.WETH, title: "USDT" }];

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MAX_FILE_SIZE = 50;
export const perPageCount = 12;
export const Network = {
  name: "Mumbai",
  chainId: 80001,
  _defaultProvider: (providers) =>
    new providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL),
};

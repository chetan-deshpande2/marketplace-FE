import BigNumber from "bignumber.js";
export const convertToEth = (amount) => {
  return new BigNumber(amount)
    .dividedBy(new BigNumber(10).exponentiatedBy(18))
    .toString();
};

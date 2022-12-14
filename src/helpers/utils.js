import contracts from '../Config/contracts';
import { Networks } from './../components/menu/AccountModal/networks';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { getBalance } from './getterFunctions';
import { Cookies } from 'react-cookie';

export const checkIfValidFileExtension = (file, validExtensions) => {
  let extension = file.type.split('/').pop();
  let isValid = validExtensions.filter((e) => {
    return e === extension;
  });
  if (isValid.length > 0) {
    return true;
  }
  return false;
};

export const checkIfValidAddress = (addr) => {
  if (addr.length <= 41) {
    return false;
  }
  return true;
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

export const getTokenSymbolByAddress = (addr) => {
  if (addr === contracts.WETH) {
    return 'WETH';
  }
  return '';
};

export const handleNetworkSwitch = async (account) => {
  // setIsPopup(false);
  // setWrongNetwork(false);
  try {
    try {
      let res1 = await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: Networks[process.env.REACT_APP_NETWORK].chainId,
          },
        ],
      });
      console.log('switched222', res1);
      let res = await getBalance(account);
      return res;
    } catch (e) {
      if (e.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ ...Networks[process.env.REACT_APP_NETWORK] }],
          });
          let res = await getBalance(account);
          return res;
        } catch (addError) {
          console.error(addError);
          if (addError.code === 4001) NotificationManager.error('User denied', '', 800);
          return false;
        }
      } else {
        NotificationManager.error('Something went wrong', '', 800);
        return false;
      }
    }
  } catch (e) {
    if (e.code === 4001) NotificationManager.error('User denied', '', 800);
    console.log('error in switch', e);
    return false;
  }
};

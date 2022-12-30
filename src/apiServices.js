import { ethers } from 'ethers';

// const REACT_APP_API_BASE_URL = 'http://192.168.1.48:3000/api/v1';
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const exportInstance = async (SCAddress, ABI) => {
  let provider = new ethers.providers.Web3Provider(window.ethereum);
  let signer = provider.getSigner();
  let a = new ethers.Contract(SCAddress, ABI, signer);
  console.log(a);
  if (a) {
    return a;
  } else {
    return {};
  }
};

export const Register = async (account) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sWalletAddress: account,
    }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/auth/register',
      requestOptions
    );

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const data = isJson && (await response.json());
    console.log(data);

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
  } catch (error) {
    //   this.setState({ postId: data.id });

    // this.setState({ errorMessage: error.toString() });
    console.error('There was an error!', error);
  }
};

export const Login = async (account) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sWalletAddress: account,
    }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/auth/login',
      requestOptions
    );

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const data = isJson && (await response.json());
    console.log(data);
    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    console.log('token', data.token);
    localStorage.setItem('Authorization', data.token);
    return data.token;
    //   this.setState({ postId: data.id });
  } catch (error) {
    // this.setState({ errorMessage: error.toString() });
    console.error('There was an error!', error);
  }
};

export const Logout = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getHeaders(),
    },
  };
  const response = await fetch(
    REACT_APP_API_BASE_URL + '/auth/Logout',
    requestOptions
  );

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');

  const data = isJson && (await response.json());
  console.log(data);

  localStorage.removeItem('Authorization', data.token);
};

export const getProfile = async () => {
  const response = await fetch(REACT_APP_API_BASE_URL + '/user/profile', {
    headers: { Authorization: getHeaders() },
  });
  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const data = isJson && (await response.json());
  console.log(data);
  return data;
};

export const getUserById = async (id) => {
  console.log(id);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id),
  };

  let response = await fetch(
    REACT_APP_API_BASE_URL + '/user/getAddressById',
    requestOptions
  );
  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const data = isJson && (await response.json());
  console.log(data);
  return data;
};

export const getHeaders = () => {
  let t = localStorage.getItem('Authorization');
  return t && t !== undefined ? t : '';
};

export const checkuseraddress = async (account) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sWalletAddress: account,
    }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/auth/checkuseraddress',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const data = isJson && (await response.json());
    console.log(data.message);
    return data;
  } catch (err) {
    return err;
  }
};

export const updateProfile = async (account, data) => {
  console.log(account, data);
  const requestOptions = {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/user/updateProfile',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.message;
  } catch (err) {
    return err;
  }
};

export const Follow = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify({ id: data }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/user/follow',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.message;
  } catch (err) {
    return err;
  }
};

export const GetAllUserDetails = async () => {
  let searchData = {
    length: 8,
    start: 0,
    sTextsearch: '',
    sSellingType: '',
    sSortingType: 'Recently Added',
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(searchData),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/user/allDetails',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetIndividualAuthorDetail = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/user/profileDetail',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);

    if (datas) return datas.user;
    return [];
  } catch (err) {
    return err;
  }
};

export const getUsersCollections = async () => {
  console.log(localStorage.getItem('Authorization'));
  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: localStorage.getItem('Authorization'),
    },
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/collection/collectionList',
      requestOptions
    );

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas.results[0]);
    if (datas) return datas;
    return [];
  } catch (err) {
    return err;
  }
};

export const getNFTList = async () => {
  // let searchData = {
  //   length: 9,
  //   start: 0,
  //   eType: ["All"],
  //   sTextsearch: "",
  //   sSellingType: "",
  //   sSortingType: "Recently Added",
  //   sFrom: 0,
  //   sTo: 0,
  //   sGenre: [],
  // };
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getAllNfts',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const createCollection = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('Authorization'),
    },
    body: data,
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/collection/createCollection',
      requestOptions
    );
    console.log('response', response);
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.message;
  } catch (err) {
    return err;
  }
};

export const getAllCollections = async () => {
  const requestOptions = {
    method: 'GET',
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getCollections',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const getCollectionWiseList = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/allCollectionWiseList',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const Like = async () => {};

export const getOrderDetails = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/order/getOrder',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log('get order data is--->', datas);
    return datas.order;
  } catch (err) {
    return err;
  }
};

export const GetOnSaleItems = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getOnSaleItems',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas.results);
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetNftDetails = async (id) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    console.log(id);
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/viewnft/' + id,
      requestOptions
    );

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas;
    // return datas.data ? datas.data : [];
  } catch (err) {
    return err;
  }
};

export const SetNFTOrder = async (data) => {
  try {
    const requestOptions = {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('Authorization'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/setNFTOrder',
      requestOptions
    );
    console.log('record updated', response);
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const UpdateOrderStatus = async (data) => {
  const requestOptions = {
    method: 'PUT',

    headers: {
      Authorization: localStorage.getItem('Authorization'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/order/updateOrder',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const LikeNft = async (data) => {
  const requestOptions = {
    method: 'POST',

    headers: {
      Authorization: localStorage.getItem('Authorization'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/like',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetCollectionsByAddress = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/collection/getCollectionDetailsByAddress/',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(data);
    return datas.collection;
  } catch (err) {
    return err;
  }
};

export const GetCollectionsById = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getCollectionDetailsById/',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyNftList = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getNFTList',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyCollectionsList = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/myCollectionList',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyLikedNft = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getUserLikedNfts',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetMyOnSaleNft = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getUserOnSaleNfts',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log('dataaasss on sale', datas);
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetCollectionsNftList = async (data, owned = false) => {
  console.log('Data', data);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      owned
        ? REACT_APP_API_BASE_URL + '/nft/getCollectionNFT'
        : REACT_APP_API_BASE_URL + '/nft/getCollectionNFTOwned',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetSearchedNft = async (data, owned = false) => {
  console.log('Data', data);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getSearchedNft',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const updateBidNft = async (data) => {
  console.log('dataaa', data);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/bid/updateBidNft',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas;
  } catch (err) {
    return err;
  }
};

export const fetchBidNft = async (data) => {
  console.log('Data', data);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/bid/fetchBidNft',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas;
  } catch (err) {
    return err;
  }
};

export const GetOrdersByNftId = async (data) => {
  //   {
  //     "nftId": "6229812aa2c3ed3120651ca6",
  //     "sortKey": "oTokenId",
  //     "sortType": -1,
  //     "page": 1,
  //     "limit": 4
  // }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/order/getOrdersByNftId',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas.AllOrders);
    return datas.AllOrders;
  } catch (err) {
    return err;
  }
};

export const createNft = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('Authorization'),
    },
    body: data,
  };
  try {
    console.log('create nft');
    // for (var value of data.values()) {
    //   console.log(value);
    // }

    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/create',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);

    return datas;
  } catch (err) {
    return err;
  }
};

export const createOrder = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('Authorization'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    console.log('put on marketplace');

    let response = await fetch(
      REACT_APP_API_BASE_URL + '/order/createOrder',
      requestOptions
    );

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);

    return datas;
  } catch (err) {
    return err;
  }
};

export const DeleteOrder = async (data) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };

  try {
    console.log('remove');

    let response = await fetch(
      REACT_APP_API_BASE_URL + '/order/deleteOrder',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const TransferNfts = async (data) => {
  //   {
  //     "nftId": "6229812aa2c3ed3120651ca6",
  //     "sortKey": "oTokenId",
  //     "sortType": -1,
  //     "page": 1,
  //     "limit": 4
  // }
  console.log('transfer nft');

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/transferNfts',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const createBidNft = async (data) => {
  console.log('place a bid');

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/bid/createBidNft',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(data);
    return datas.result;
  } catch (err) {
    return err;
  }
};

export const acceptBid = async (data) => {
  console.log('accept bid');

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Authorization'),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/bid/acceptBidNft',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const InsertHistory = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/history/insert',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetHistory = async (data) => {
  console.log(data);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/history/fetchHistory',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas.results);
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetHotCollections = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      process.env.REACT_APP_API_BASE_URL + '/nft/getHotCollections',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const UpdateTokenCount = async (data) => {
  console.log(data);
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: window.sessionStorage.getItem('Authorization'),
    },
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + `/collection/updateCollectionToken/${data}`,
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetOwnedNftList = async (data) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + '/nft/getOwnedNFTList',
      requestOptions
    );
    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const datas = isJson && (await response.json());
    console.log(datas);
    return datas.results;
  } catch (err) {
    return err;
  }
};

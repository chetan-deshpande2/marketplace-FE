import { ethers } from "ethers";

const REACT_APP_API_BASE_URL = "http://192.168.1.11:3000/api/v1";

export const exportInstance = async (SCAddress, ABI) => {
  let provider = new ethers.providers.Web3Provider(window.ethereum);
  let signer = provider.getSigner();
  let a = new ethers.Contract(SCAddress, ABI, signer);

  if (a) {
    return a;
  } else {
    return {};
  }
};

export const Register = async (account) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sWalletAddress: account,
    }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/auth/register",
      requestOptions
    );

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson && (await response.json());

    if (!response.ok) {
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
  } catch (error) {}
};

export const Login = async (account) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sWalletAddress: account,
    }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/auth/login",
      requestOptions
    );

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson && (await response.json());

    if (!response.ok) {
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }

    localStorage.setItem("Authorization", data.token);
    return data.token;
  } catch (error) {}
};

export const Logout = async () => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getHeaders(),
    },
  };
  const response = await fetch(
    REACT_APP_API_BASE_URL + "/auth/Logout",
    requestOptions
  );

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");

  const data = isJson && (await response.json());

  localStorage.removeItem("Authorization", data.token);
};

export const getProfile = async () => {
  const response = await fetch(REACT_APP_API_BASE_URL + "/user/profile", {
    headers: { Authorization: getHeaders() },
  });
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson && (await response.json());
  return data;
};

export const getHeaders = () => {
  let t = localStorage.getItem("Authorization");
  return t && t !== undefined ? t : "";
};

export const checkuseraddress = async (account) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sWalletAddress: account,
    }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/auth/checkuseraddress",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson && (await response.json());
    return data;
  } catch (err) {
    return err;
  }
};

export const updateProfile = async (account, data) => {
  let formData = new FormData();

  formData.append("sUserName", data.uname ? data.uname : "");
  formData.append("sFirstname", data.fname ? data.fname : "");
  formData.append("sLastname", data.lname ? data.lname : "");
  formData.append("sBio", data.bio ? data.bio : "");
  formData.append("sWebsite", data.website ? data.website : "");
  formData.append("sEmail", data.email ? data.email : "");
  formData.append("sWalletAddress", account);
  formData.append("userProfile", data.profilePic ? data.profilePic : "");

  const requestOptions = {
    method: "PUT",
    headers: {
      Authorization: localStorage.getItem("Authorization"),
    },
    body: formData,
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/user/updateProfile",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.message;
  } catch (err) {
    return err;
  }
};

export const Follow = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify({ id: data }),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/user/follow",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
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
    sTextsearch: "",
    sSellingType: "",
    sSortingType: "Recently Added",
  };
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchData),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/user/allDetails",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetIndividualAuthorDetail = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/user/profileDetail",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());

    if (datas.data) return datas.data;
    return [];
  } catch (err) {
    return err;
  }
};

export const getUsersCollections = async () => {
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("Authorization"),
    },
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/collection/collectionList",
      requestOptions
    );

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    if (datas) return datas;
    return [];
  } catch (err) {
    return err;
  }
};

export const getNFTList = async () => {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getAllNfts",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const createCollection = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("Authorization"),
    },
    body: data,
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/collection/createCollection",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.message;
  } catch (err) {
    return err;
  }
};

export const getAllCollections = async () => {
  const requestOptions = {
    method: "GET",
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getCollections",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const getCollectionWiseList = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/allCollectionWiseList",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const Like = async () => {};

export const getOrderDetails = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/order/getOrder",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetOnSaleItems = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getOnSaleItems",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetNftDetails = async (id) => {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/viewnft/" + id,
      requestOptions
    );

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
  } catch (err) {
    return err;
  }
};

export const SetNFTOrder = async (data) => {
  try {
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("Authorization"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/setNFTOrder",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const UpdateOrderStatus = async (data) => {
  const requestOptions = {
    method: "PUT",

    headers: {
      Authorization: localStorage.getItem("Authorization"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/order/updateOrder",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const LikeNft = async (data) => {
  const requestOptions = {
    method: "POST",

    headers: {
      Authorization: localStorage.getItem("Authorization"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/like",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetCollectionsByAddress = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getCollectionDetailsByAddress/",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetCollectionsById = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getCollectionDetailsById/",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyNftList = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getNFTList",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyCollectionsList = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/myCollectionList",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyLikedNft = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getUserLikedNfts",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetMyOnSaleNft = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getUserOnSaleNfts",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.results;
  } catch (err) {
    return err;
  }
};

export const GetCollectionsNftList = async (data, owned = false) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      owned
        ? REACT_APP_API_BASE_URL + "/nft/getCollectionNFT"
        : REACT_APP_API_BASE_URL + "/nft/getCollectionNFTOwned",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetSearchedNft = async (data, owned = false) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/getSearchedNft",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const updateBidNft = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/bid/updateBidNft",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas;
  } catch (err) {
    return err;
  }
};

export const fetchBidNft = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/bid/fetchBidNft",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas;
  } catch (err) {
    return err;
  }
};

export const GetOrdersByNftId = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/order/getOrdersByNftId",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const createNft = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("Authorization"),
    },
    body: data,
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/create",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());

    return datas;
  } catch (err) {
    return err;
  }
};

export const createOrder = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("Authorization"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/order/createOrder",
      requestOptions
    );

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());

    return datas;
  } catch (err) {
    return err;
  }
};

export const DeleteOrder = async (data) => {
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/order/deleteOrder",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const TransferNfts = async (data) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/nft/transferNfts",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const createBidNft = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/bid/createBidNft",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const acceptBid = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("Authorization"),
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/bid/acceptBidNft",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const InsertHistory = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/history/insert",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

export const GetHistory = async (data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    let response = await fetch(
      REACT_APP_API_BASE_URL + "/history/fetchHistory",
      requestOptions
    );
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const datas = isJson && (await response.json());
    return datas.data;
  } catch (err) {
    return err;
  }
};

import React, { useState, useEffect, useRef } from 'react';
import Clock from '../components/Clock';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import $ from 'jquery';
import Loader from '../components/loader';
import './styles.css';

//*==========
import { useCookies } from 'react-cookie';
import Avatar from './../../assets/images/avatar5.jpg';
import ItemNotFound from './ItemNotFound';
import {
  createNft,
  createOrder,
  getProfile,
  getUsersCollections,
  InsertHistory,
  SetNFTOrder,
  exportInstance,
} from '../../apiServices';
import UploadImg from '../../assets/images/upload-image.jpg';
import { handleCollectionCreation, handleBuyNft } from '../../helpers/sendFunctions';
import { UpdateTokenCount } from '../../apiServices';
import { getSignature, checkIfCollectionNameAlreadyTaken } from '../../helpers/getterFunctions';
import { options } from '../../helpers/constants';
import { CURRENCY, GENERAL_DATE, GENERAL_TIMESTAMP, MAX_FILE_SIZE } from '../../helpers/constants';
// import simplerERC1155ABI from '../../Config/abis/simpleERC1155.json';
import extendedERC1155Abi from '../../Config/abis/extendedERC1155Abi.json';
import contracts from '../../Config/contracts';
import { ethers } from 'ethers';
import { connect } from 'react-redux';
import { parseEther } from 'ethers/lib/utils.js';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { Row, Col } from 'react-bootstrap';
import { convertToEth } from '../../helpers/numberFormatter';
import {
  checkIfValidAddress,
  checkIfValidFileExtension,
  getMaxAllowedDate,
  getTokenSymbolByAddress,
  handleNetworkSwitch,
} from '../../helpers/utils';
import previewImage from './../../assets/images/preview.jpeg';
import { showProcessingModal } from '../../utils';
import moment from 'moment';
import '../../assets/Create.css'

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  // header#myHeader .logo .d-block{
  //   display: none !important;
  // }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const CreateMultiple = (props) => {
  const [nftFiles, setNftFiles] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isUnlock, setIsUnlock] = useState(true);
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState();
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState('');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState('');
  const [collections, setCollections] = useState([]);
  const [nftContractAddress, setNftContractAddress] = useState('');
  const [nftImage, setNftImage] = useState('');
  const [nftDesc, setNftDesc] = useState('');
  const [nftTitle, setNftTitle] = useState('');
  const [nextId, setNextId] = useState('');
  const [profilePic, setProfilePic] = useState();
  const [isOpenForBid, setIsOpenForBid] = useState();
  const [timeLeft, setTimeLeft] = useState();
  const [isTimedAuction, setIsTimedAuction] = useState();

  const [collaborators, setCollaborators] = useState([]);
  const [currCollaborator, setCurrCollaborator] = useState();
  const [collaboratorPercents, setCollaboratorPercents] = useState([]);
  const [currCollaboratorPercent, setCurrCollaboratorPercent] = useState();

  const [propertyKeys, setPropertyKeys] = useState([]);
  const [currPropertyKey, setCurrPropertyKey] = useState();
  const [propertyValues, setPropertyValues] = useState([]);
  const [currPropertyValue, setCurrPropertyValue] = useState();

  const [saleType, setSaleType] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [salt, setSalt] = useState();
  const [isPopup, setIsPopup] = useState(false);
  const [chosenType, setChosenType] = useState(0);
  const [minimumBid, setMinimumBid] = useState('');
  const [endTime, setEndTime] = useState();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState(contracts.USDT);
  const [isAdvancedSetting, setIsAdvancedSetting] = useState(false);
  const [isPutOnMarketplace, setIsPutOnMarketPlace] = useState(true);
  const [onTimedAuction, setOnTimedAuction] = useState(false);

  /************ Create NFT Popup Checks ********** */
  const [isShowPopup, setisShowPopup] = useState(false);
  const [hideClosePopup, sethideClosePopup] = useState(true);
  const [hideRedirectPopup, sethideRedirectPopup] = useState(false);
  const [ClosePopupDisabled, setClosePopupDisabled] = useState(true);
  const [RedirectPopupDisabled, setRedirectPopupDisabled] = useState(true);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(CURRENCY);

  const [createdItemId, setCreatedItemId] = useState();

  const [isUploadPopupClass, setisUploadPopupClass] = useState('checkiconDefault');
  const [isApprovePopupClass, setisApprovePopupClass] = useState('checkiconDefault');
  const [isMintPopupClass, setisMintPopupClass] = useState('checkiconDefault');
  const [isRoyaltyPopupClass, setisRoyaltyPopupClass] = useState('checkiconDefault');
  const [isPutOnSalePopupClass, setisPutOnSalePopupClass] = useState('checkiconDefault');
  const [lockedContent, setLockedContent] = useState('');
  const [profile, setProfile] = useState();
  const [currentUser, setCurrentUser] = useState('');
  const [collectionCreation, setCollectionCreation] = useState(false);
  const [isLazyMinting, setIsLazyMinting] = useState(false);
  const [cookies, setCookie] = useCookies(['selected_account', 'Authorization']);

  const myRef = React.createRef();

  const fileRef = useRef();
  const fileRefCollection = useRef();

  const togglePopup = () => {
    console.log(currentUser);
    if (!currentUser) {
      NotificationManager.error('Please Connect Your Wallet', '', 800);
      return;
    }
    setIsPopup(!isPopup);
  };

  function onClickRefresh() {
    window.location.reload();
  }

  function closePopup() {
    setisShowPopup(false);
    sethideClosePopup(true);
    sethideRedirectPopup(false);
    setClosePopupDisabled(true);
    setRedirectPopupDisabled(true);
    setisUploadPopupClass('checkiconDefault');
    setisApprovePopupClass('checkiconDefault');
    setisMintPopupClass('checkiconDefault');
    setisRoyaltyPopupClass('checkiconDefault');
    setisPutOnSalePopupClass('checkiconDefault');
  }

  function stopCreateNFTPopup() {
    sethideRedirectPopup(false);
    setClosePopupDisabled(false);
    sethideClosePopup(true);
  }

  function redirectCreateNFTPopup() {
    if (createdItemId) window.location.href = `/itemDetail/${createdItemId}`;
    else window.location.href = `/profile`;
  }

  function inputPrice(event) {
    const re = /[+-]?[0-9]+\.?[0-9]*/;
    let val = event.target.value;
    if (event.target.value === '' || re.test(event.target.value)) {
      const numStr = String(val);
      if (numStr.includes('.')) {
        if (numStr.split('.')[1].length > 8) {
        } else {
          if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, '');
          }
          if (val.length === 2 && val !== '0.') {
            val = Number(val);
          }
          setPrice(val);
        }
      } else {
        if (val.split('.').length > 2) {
          val = val.replace(/\.+$/, '');
        }
        if (val.length === 2 && val !== '0.') {
          val = Number(val);
        }
        setPrice(val);
      }
    }
  }

  function inputPriceAuction(event) {
    const re = /[+-]?[0-9]+\.?[0-9]*/;
    let val = event.target.value;
    if (event.target.value === '' || re.test(event.target.value)) {
      const numStr = String(val);
      if (numStr.includes('.')) {
        if (numStr.split('.')[1].length > 8) {
        } else {
          if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, '');
          }
          if (val.length === 2 && val !== '0.') {
            val = Number(val);
          }
          setMinimumBid(val);
        }
      } else {
        if (val.split('.').length > 2) {
          val = val.replace(/\.+$/, '');
        }
        if (val.length === 2 && val !== '0.') {
          val = Number(val);
        }
        setMinimumBid(val);
      }
    }
  }

  const onChange = (e) => {
    var nftFiles = e.target.files;
    var filesArr = Array.prototype.slice.call(nftFiles);
    var file = e.target.files[0];
    if (!checkIfValidFileExtension(file, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
      NotificationManager.error('This file type not supported', '', 800);
      return;
    }
    if (file.size / 1000000 > MAX_FILE_SIZE)
      NotificationManager.warning(`File size should be less than ${MAX_FILE_SIZE} MB`);

    document.getElementById('file_name').style.display = 'none';
    setNftFiles([...nftFiles, ...filesArr]);
    if (e.target.files && e.target.files[0]) {
      let img = e.target.files[0];
      setNftImage(img);
    }
  };

  //*============

  function closeCreateNFTPopup() {
    sethideClosePopup(false);
    setRedirectPopupDisabled(false);
    sethideRedirectPopup(true);
  }

  function onClickRefresh() {
    window.location.reload();
  }
  const clickToUnlock = () => {
    setIsUnlock(!isUnlock);
    setIsPutOnMarketPlace(true);
  };

  const onCollectionImgChange = (e) => {
    var files = e.target.files;
    var filesArr = Array.prototype.slice.call(files);
    var file = e.target.files[0];
    if (!checkIfValidFileExtension(file, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
      NotificationManager.error('This file type not supported', '', 800);
      return;
    }
    if (file.size / 1000000 > MAX_FILE_SIZE)
      NotificationManager.warning(`File size should be less than ${MAX_FILE_SIZE} MB`, '', 800);
    document.getElementById('collection_file_name').style.display = 'none';

    setFiles([...files, ...filesArr]);
    if (e.target.files && e.target.files[0]) {
      let img = e.target.files[0];
      setImage(img);
    }
  };

  const handleShow = () => {
    setOnTimedAuction(false);
    document.getElementById('tab_opt_1').classList.add('show');
    document.getElementById('tab_opt_1').classList.remove('hide');
    document.getElementById('tab_opt_2').classList.add('hide');
    document.getElementById('tab_opt_2').classList.remove('show');
    document.getElementById('tab_opt_3').classList.add('hide');
    document.getElementById('tab_opt_3').classList.remove('show');
    document.getElementById('btn1').classList.add('active');
    document.getElementById('btn2').classList.remove('active');
    document.getElementById('btn3').classList.remove('active');
    setSaleType(0);
    setChosenType(0);
    setPrice('');
    setMinimumBid('');
    setSelectedTokenSymbol('MATIC');
  };

  const handleShow1 = () => {
    setOnTimedAuction(true);
    document.getElementById('tab_opt_1').classList.add('hide');
    document.getElementById('tab_opt_1').classList.remove('show');
    document.getElementById('tab_opt_2').classList.add('show');
    document.getElementById('tab_opt_2').classList.remove('hide');
    document.getElementById('tab_opt_3').classList.add('hide');
    document.getElementById('tab_opt_3').classList.remove('show');
    document.getElementById('btn1').classList.remove('active');
    document.getElementById('btn2').classList.add('active');
    document.getElementById('btn3').classList.remove('active');
    setSaleType(1);
    setChosenType(1);
    setPrice('');
    setMinimumBid('');
    setSelectedTokenSymbol(options[0].title);
  };

  const handleShow2 = () => {
    setOnTimedAuction(false);
    document.getElementById('tab_opt_1').classList.add('hide');
    document.getElementById('tab_opt_1').classList.remove('show');
    document.getElementById('tab_opt_2').classList.add('hide');
    document.getElementById('tab_opt_2').classList.remove('show');
    document.getElementById('tab_opt_3').classList.remove('hide');
    document.getElementById('tab_opt_3').classList.add('show');
    document.getElementById('btn1').classList.remove('active');
    document.getElementById('btn2').classList.remove('active');
    document.getElementById('btn3').classList.add('active');
    setSaleType(1);
    setChosenType(2);
    setPrice('');
    setMinimumBid('');
    setSelectedTokenSymbol(options[0].title);
  };

  const handleShow3 = () => {
    document.getElementById('btn4').classList.add('active');
  };

  const handleShow4 = (address, i) => {
    setNftContractAddress(address);
    $('.active').removeClass('clicked');
    $('#my_cus_btn' + i).addClass('clicked');
  };

  const clickToLazyMint = () => {
    if (isLazyMinting) {
      setIsLazyMinting(false);
    } else {
      setIsLazyMinting(true);
    }
  };

  const unlockClick = () => {
    setIsActive(true);
  };

  const unlockHide = () => {
    setIsActive(false);
  };

  const handleAddCollaborator = async () => {
    console.log('currCollaborator,currCollaboratorPercent', currCollaborator, currCollaboratorPercent);
    if (currCollaborator === '' || currCollaboratorPercent === '') {
      NotificationManager.error('Invalid inputs');
      return;
    }
    if (currCollaborator.length <= 41) {
      NotificationManager.error('Invalid Address');
      return;
    }

    if (Number(currCollaboratorPercent) > 10000) {
      NotificationManager.error('percentage should be less than 100');
    }

    let tempArr1 = [];
    let tempArr2 = [];
    if (currCollaborator) {
      tempArr1.push(...collaborators, currCollaborator.toLowerCase());
      tempArr2.push(...collaboratorPercents, Number(currCollaboratorPercent));
    }

    let sum = 0;
    for (let i = 0; i < tempArr2.length; i++) {
      sum = sum + Number(tempArr2[i]);
    }
    console.log('sum22', sum);
    if (sum > 90) {
      NotificationManager.error('Total percentage should be less than 90');
      return;
    }
    setCollaborators(tempArr1);
    setCollaboratorPercents(tempArr2);
    setCurrCollaborator('');
    setCurrCollaboratorPercent(0);
  };

  const handleRemoveCollaborator = async (index) => {
    let tempArr1 = [...collaborators];
    tempArr1[index] = '';
    setCollaborators(tempArr1);
    let tempArr2 = [...collaboratorPercents];
    tempArr2[index] = '';
    setCollaboratorPercents(tempArr2);
  };

  const handleAddProperty = async () => {
    if (currPropertyKey === '' || currPropertyValue === '') {
      NotificationManager.error('Invalid inputs');
      return;
    }

    let tempArr1 = [];
    let tempArr2 = [];
    if (currPropertyKey) {
      tempArr1.push(...propertyKeys, currPropertyKey);
      tempArr2.push(...propertyValues, currPropertyValue);
    }

    setPropertyKeys(tempArr1);
    setPropertyValues(tempArr2);
    setCurrPropertyKey('');
    setCurrPropertyValue('');
  };

  const handleRemoveProperty = async (index) => {
    let tempArr1 = [...propertyKeys];
    tempArr1[index] = '';
    setPropertyKeys(tempArr1);
    let tempArr2 = [...propertyValues];
    tempArr2[index] = '';
    setPropertyValues(tempArr2);
  };

  const validateInputs = () => {
    let sum = 0;
    for (let i = 0; i < collaboratorPercents.length; i++) {
      sum = sum + Number(collaboratorPercents[i]);
    }
    if (sum > 100) {
      NotificationManager.error('Total percentage should be less than 100', '', 800);
      setLoading(false);
      return false;
    }
    if (!nftContractAddress) {
      NotificationManager.error('Please Choose Valid Collection', '', 800);
      return false;
    }

    // if(!title){
    //   NotificationManager.error("Please choose valid title");
    //   return false;
    // }
    return true;
  };

  //*======================

  const handleCollectionCreate = async () => {
    console.log(props);
    let res = await handleNetworkSwitch(currentUser);
    setCookie('balance', res, { path: '/' });
    if (res === false) return;
    setIsPopup(false);
    setCollectionCreation(true);
    if (!currentUser && profile) {
      NotificationManager.error('Please Connect Your Wallet', '', 800);
      return;
    }

    try {
      let _title = title.replace(/^\s+|\s+$/g, '');
      if (_title === '' || _title === undefined) {
        NotificationManager.error('Please Enter Title', '', 800);
        setCollectionCreation(false);
        return;
      }
      if (image === undefined) {
        NotificationManager.error('Please Upload Image', '', 800);
        setCollectionCreation(false);
        return;
      }
      if (symbol === '') {
        NotificationManager.error('Please Enter symbol', '', 800);
        setCollectionCreation(false);
        return;
      }
      // let res = await checkIfCollectionNameAlreadyTaken(_title);
      // if (res === true) {
      //   NotificationManager.error('Collection Name Already Taken', '', 800);
      //   setCollectionCreation(false);
      //   return;
      // }
      if (files && files.length > 0) {
        if (files[0].size / 1000000 > MAX_FILE_SIZE) {
          NotificationManager.error(`File size should be less than ${MAX_FILE_SIZE} MB`, '', 800);
          return;
        }
      }
      setCollectionCreation(true);
      let collectionData = {
        sName: _title,
        sDescription: description,
        nftFile: image,
        erc721: JSON.stringify(false),
        sRoyaltyPercentage: Number(royalty) * 100,

        symbol: symbol,
      };
      let collectionsList = '';
      try {
        let ress = await handleCollectionCreation(false, collectionData, currentUser);
        collectionsList = await getUsersCollections({
          page: 1,
          limit: 100,
          userId: profile._id,
        });
        if (collectionsList && collectionsList?.results?.length > 0) {
          collectionsList.results = collectionsList?.results?.filter((collection) => {
            return collection.erc721 === false;
          });
          setCollections(collectionsList?.results);

          window.location.reload();
        }
        if (ress === false) {
          setCollectionCreation(false);
          // window.location.reload();
        }
      } catch (e) {
        setCollectionCreation(false);
        return;
      }

      setCollectionCreation(false);
      togglePopup();
      window.location.reload();
    } catch (e) {
      setCollectionCreation(false);
      togglePopup();
      console.log(e);
    }
  };

  const handleNftCreation = async () => {
    let res = await handleNetworkSwitch(currentUser);
    console.log(res);
    setCookie('balance', res, { path: '/' });
    if (res === false) return;
    let options;
    if (!currentUser) {
      NotificationManager.error('Please Connect Your Wallet', '', 800);
      return;
    }
    let _nftTitle = nftTitle.replace(/^\s+|\s+$/g, '');
    if (_nftTitle && _nftTitle.length > 0) {
      if (_nftTitle[0].size / 1000000 > MAX_FILE_SIZE) {
        NotificationManager.error(`File size should be less than ${MAX_FILE_SIZE} MB`);
        return;
      }
    }
    if (!nftImage) {
      NotificationManager.error('Please Upload NFT Image', '', 800);
      return;
    }
    if (_nftTitle === '' || _nftTitle === undefined) {
      NotificationManager.error('Please Enter NFT Title', '', 800);
      return;
    }
    if (quantity === '' || quantity === 0 || quantity === undefined) {
      NotificationManager.error('Please Enter NFT Quantity', '', 800);
      return;
    }

    if (Number(quantity) < 1) {
      NotificationManager.error("Quantity can't be 0", '', 800);
      return;
    }
    if (isPutOnMarketplace) {
      if (chosenType === 0 && Number(price) <= 0) {
        NotificationManager.error("Price can't be less than zero", '', 800);
        return;
      }
      if ((chosenType === 1 || chosenType === 2) && Number(minimumBid) <= 0) {
        NotificationManager.error("minimum bid amount can't be less than zero", '', 800);
        return;
      }
    }
    if (onTimedAuction && endTime === undefined) {
      NotificationManager.error('Please Select an Expiration Date');
      return;
    }
    try {
      console.log('updateCount');
      await UpdateTokenCount(nftContractAddress);
    } catch (e) {
      console.log('error', e);
    }
    if (currentUser && profile) {
      try {
        let isValid = validateInputs();
        if (!isValid) return;

        setisShowPopup(true);
        setisApprovePopupClass('clockloader');
        console.log(nftContractAddress);

        const NFTcontract = await exportInstance(nftContractAddress, extendedERC1155Abi.abi);

        try {
          // let gasLimit = await NFTcontract.estimateGas.isApprovedForAll(
          //   currentUser,
          //   contracts.MARKETPLACE,
          //   { from: currentUser, value: 0 }
          // );
          // options = {
          //   from: currentUser,
          //   gasLimit: gasLimit + 10,
          //   value: 0,
          // };
          options = {
            from: currentUser,
            gasPrice: 10000000000,
            gasLimit: 9000000,
            value: 0,
          };
          let approval = await NFTcontract.isApprovedForAll(currentUser, contracts.MARKETPLACE);
          let approvalRes;

          if (approval) {
            setisApprovePopupClass('checkiconCompleted');
          }
          if (!approval) {
            approvalRes = await NFTcontract.setApprovalForAll(contracts.MARKETPLACE, true);
            approvalRes = await approvalRes.wait();
            if (approvalRes.status === 0) {
              NotificationManager.error('Transaction failed', '', 800);
              return;
            }
            if (approvalRes) {
              setisApprovePopupClass('checkiconCompleted');
            } else {
              setisApprovePopupClass('errorIcon');
              stopCreateNFTPopup();
              return;
            }
            NotificationManager.success('Approved', '', 800);
          }
        } catch (e) {
          console.log('err', e);
          setisApprovePopupClass('errorIcon');
          stopCreateNFTPopup();
          return;
        }

        setisMintPopupClass('clockloader');
        if (!isLazyMinting) {
          let res1 = '';
          try {
            // let gasLimit = await NFTcontract.estimateGas.mint(
            //   currentUser,
            //   nextId,
            //   quantity,
            //   { from: currentUser, value: 0 }
            // );
            const options = {
              from: currentUser,
              gasLimit: 9000000,
              value: 0,
            };
            let mintRes = await NFTcontract.mint(currentUser, nextId, quantity);

            res1 = await mintRes.wait();
            if (res1.status === 0) {
              stopCreateNFTPopup();
              return;
              return;
            }
          } catch (minterr) {
            setisMintPopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
        }

        setisMintPopupClass('checkiconCompleted');
        setisRoyaltyPopupClass('clockloader');
        let localCollabPercent = [];
        for (let i = 0; i < collaboratorPercents.length; i++) {
          localCollabPercent[i] = Number(collaboratorPercents[i]) * 100;
        }
        if (collaborators.length > 0) {
          try {
            // let gasLimit =
            //   await NFTcontract.estimateGas.setTokenRoyaltyDistribution(
            //     collaborators,
            //     localCollabPercent,
            //     nextId,
            //     { from: currentUser, value: 0 }
            //   );
            options = {
              from: currentUser,
              gasLimit: 9000000,
              value: 0,
            };
            let collaborator = await NFTcontract.setTokenRoyaltyDistribution(collaborators, localCollabPercent, nextId);
            await collaborator.wait();
          } catch (Collerr) {
            setisRoyaltyPopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
        }
        setisRoyaltyPopupClass('checkiconCompleted');
        let metaData = [];
        for (let i = 0; i < propertyKeys.length; i++) {
          metaData.push({
            trait_type: propertyKeys[i],
            value: propertyValues[i],
          });
        }

        var fd = new FormData();
        fd.append('metaData', JSON.stringify(metaData));
        fd.append('nCreatorAddress', currentUser.toLowerCase());
        fd.append('nTitle', _nftTitle);
        fd.append('nftFile', nftImage);
        fd.append('nQuantity', quantity);
        fd.append('nCollaborator', [...collaborators]);
        fd.append('nCollaboratorPercentage', [...collaboratorPercents]);
        fd.append('nRoyaltyPercentage', 40);
        fd.append('nCollection', nftContractAddress);
        fd.append('nDescription', nftDesc);
        fd.append('nTokenID', nextId);
        fd.append('nType', 2);
        fd.append('lockedContent', lockedContent);
        fd.append('nLazyMintingStatus', isLazyMinting ? 1 : 0);

        setisUploadPopupClass('clockloader');

        let res = await createNft(fd);
        console.log('res========', res);
        // if (res.message === 'Invalid file type! Only JPG, JPEG, PNG, GIF, WEBP, MP3 & MPEG  files are allowed. ') {
        //   setisUploadPopupClass('errorIcon');
        //   stopCreateNFTPopup();
        //   NotificationManager.error(
        //     'Invalid file type! Only JPG, JPEG, PNG, GIF, WEBP,  MP3 & MPEG  files are allowed. ',
        //     '',
        //     800,
        //   );
        //   return;
        // }
        setCreatedItemId(res.result._id);
        console.log(setCreatedItemId(res.result._id));
        try {
          let historyMetaData = {
            nftId: res.result._id,
            userId: res.result.nCreater,
            action: 'Creation',
            actionMeta: 'Default',
            message: `${quantity} Quantity by ${
              profile && profile.sUserName
                ? profile.user.sUserName
                : profile.user.sWalletAddress
                ? profile.user.sWalletAddress.slice(0, 3) + '...' + profile.user.sWalletAddress.slice(39, 42)
                : ''
            }`,

            created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          };

          await InsertHistory(historyMetaData);
        } catch (e) {
          console.log('error in history api', e);
          return;
        }
        // if (res.data) {
        //   setisUploadPopupClass('checkiconCompleted');
        //   setisPutOnSalePopupClass('clockloader');
        // } else {
        //   setisUploadPopupClass('errorIcon');
        //   stopCreateNFTPopup();
        //   return;
        // }

        let _deadline;
        let _price;
        let _auctionEndDate;
        console.log(chosenType);
        if (chosenType === 0) {
          _deadline = GENERAL_TIMESTAMP;
          _auctionEndDate = GENERAL_DATE;
          _price = ethers.utils.parseEther(price.toString()).toString();
        } else if (chosenType === 1) {
          let _endTime = endTime ? new Date(endTime).valueOf() / 1000 : GENERAL_TIMESTAMP;
          _auctionEndDate = endTime;
          _deadline = _endTime;
          _price = ethers.utils.parseEther(minimumBid.toString()).toString();
        } else if (chosenType === 2) {
          _deadline = GENERAL_TIMESTAMP;
          _auctionEndDate = GENERAL_DATE;
          _price = ethers.utils.parseEther(minimumBid.toString()).toString();
        }

        console.log(_deadline, _price, _auctionEndDate);
        console.log(isPutOnMarketplace);
        if (isPutOnMarketplace) {
          let sellerOrder = [
            currentUser.toLowerCase(),
            nftContractAddress,
            nextId,
            quantity,
            saleType,
            saleType !== 0 ? selectedTokenAddress : '0x0000000000000000000000000000000000000000',
            _price,
            _deadline,
            [],
            [],
            salt,
          ];
          // let tokenUri = await NFTcontract.setCustomTokenUri(nextId, `https://ipfs.io/ipfs/${res.result.nHash}`, {
          //   from: currentUser,
          //   value: 0,
          // });
          // if (tokenUri && tokenUri.status === 0) {
          //   setisPutOnSalePopupClass('errorIcon');
          //   stopCreateNFTPopup();
          //   return;
          // }
          console.log(currentUser);
          let signature = await getSignature(currentUser, ...sellerOrder);
          if (signature === false) {
            setisPutOnSalePopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          let reqParams = {
            nftId: res.result._id,
            seller: currentUser.toLowerCase(),
            tokenAddress: saleType !== 0 ? selectedTokenAddress : '0x0000000000000000000000000000000000000000',
            collection: nftContractAddress,
            price: _price,
            quantity: quantity,
            saleType: saleType,
            validUpto: _deadline,
            signature: signature,
            tokenId: nextId,
            auctionEndDate: _auctionEndDate,
            salt: salt,
          };

          let data = '';
          try {
            data = await createOrder(reqParams);
            try {
              let historyMetaData = {
                nftId: res.result._id,
                userId: res.result.nCreater,
                action: 'Marketplace',
                actionMeta: 'Listed',
                message: `${quantity} quantity For ${convertToEth(_price)} ${
                  saleType === 0 ? CURRENCY : selectedTokenSymbol
                } by ${currentUser.slice(0, 3) + '...' + currentUser.slice(39, 42)} `,
                created_ts: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              };

              await InsertHistory(historyMetaData);
            } catch (e) {
              console.log('error in history api', e);
              return;
            }
          } catch (DataErr) {
            setisPutOnSalePopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          console.log(data);

          try {
            await SetNFTOrder({
              orderId: data.results._id,
              nftId: data.results.oNftId,
            });
            console.log('order Completed');
          } catch (NFTErr) {
            setisPutOnSalePopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          setisPutOnSalePopupClass('checkiconCompleted');
        }
        setisPutOnSalePopupClass('checkiconCompleted');
        closeCreateNFTPopup();
      } catch (err) {
        console.log('error', err);
        stopCreateNFTPopup();
        return;
      }
    }
  };

  useEffect(() => {
    console.log(cookies);
    setCurrentUser(cookies.selected_account);
  }, []);

  useEffect(() => {
    if (cookies.selected_account) setCurrentUser(cookies.selected_account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.selected_account]);

  useEffect(() => {
    setIsOpenForBid(false);
    setIsTimedAuction(false);
    setSaleType(0);
    setQuantity(1);
    setTimeLeft('December, 30, 2022');
    setSalt(Math.round(Math.random() * 10000000));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let profile = await getProfile();
      setProfile(profile);
      let collectionsList = await getUsersCollections({
        page: 1,
        limit: 100,
        userId: profile?._id,
      });
      if (collectionsList && collectionsList?.results?.length >= 1) {
        collectionsList.results = collectionsList.results.filter((collection) => {
          return collection.erc721 === false;
        });
        setCollections(collectionsList?.results);
      }

      if (profile && profile.sProfilePicUrl) {
        setProfilePic(profile.sProfilePicUrl);
      } else {
        setProfilePic(Avatar);
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.Authorization, cookies.selected_account, isPopup, currentUser]);

  const PropertiesSection = () => {
    return (
      <Row className="property">
        <Col>
          <input
            type="text"
            className="property-input property-key"
            placeholder="eg. Background"
            value={currPropertyKey}
            onChange={(e) => setCurrPropertyKey(e.target.value)}
          ></input>
        </Col>

        <Col>
          {' '}
          <input
            type="text"
            className="property-input property-value"
            placeholder="eg. Black"
            value={currPropertyValue}
            onChange={(e) => setCurrPropertyValue(e.target.value)}
          ></input>
        </Col>
      </Row>
    );
  };

  return !currentUser ? (
    <ItemNotFound />
  ) : (
    <div>
      <GlobalStyles />
      {loading ? showProcessingModal('Loading') : ''}
      {collectionCreation ? (
        showProcessingModal('Collection creation is under process. Please do not refresh the page')
      ) : (
        <></>
      )}

      <section
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${'./img/background/subheader.jpg'})`,
        }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Create Multiple NFT</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-9 mb-5">
            <div id="form-create-item" className="form-border" action="#">
              <div className="field-set">
                <h5 className="required">Choose Collection</h5>

                <div className="de_tab tab_methods">
                  <div className="scrollable mb-5 c-collections">
                    <ul className="de_nav">
                      <li id="btn4" className="active" onClick={handleShow3}>
                        <span onClick={togglePopup}>
                          <i className="fa fa-plus"></i>Create New
                        </span>
                      </li>

                      {isPopup && (
                        <div className="collection-popup-box custom-popup-box">
                          {/* {loading ? <Loader /> : <></>} */}
                          <span className="close-icon" onClick={togglePopup}>
                            x
                          </span>
                          <div className="add-collection-box">
                            <div className="add-collection-popup-content text-center">
                              <div className="CollectionPopupBox">
                                <div className="row">
                                  <h3>Collections</h3>
                                  <div id="form-create-item" className="form-border" action="#">
                                    <div className="collection-field-set">
                                      <span className="sub-heading">Upload Collection Cover</span>
                                      <div className="fileUploader mt-3">
                                        <div className="row align-items-center justify-content-center">
                                          <div className="col-md-6 col-sm-12 uploadImg-container">
                                          <div className='img-upload-box'>
                                            {!image ? (
                                              <img
                                                alt="upload image"
                                                src={UploadImg}
                                                className=""
                                                onClick={() => fileRefCollection.current.click()}
                                              />
                                            ) : (
                                              <img
                                                src={URL.createObjectURL(image)}
                                                id="get_file_2"
                                                className="collection_cover_preview img-fluid"
                                                style={{height: '100%', borderRadius:'8px'}}
                                                alt=""
                                                onClick={() => fileRefCollection.current.click()}
                                              />
                                            )}
                                            </div>
                                          </div>
                                          <div className="d-create-file col-md-6 uploadImg-right modal-file-upload">
                                            <p id="collection_file_name">
                                              We recommend an image of at least 450x450. PNG, JPG, GIF, WEBP or MP4. Max
                                              {MAX_FILE_SIZE}mb.
                                            </p>
                                            {files && files.length > 0 ? <p>{files[0].name}</p> : ''}
                                            <div className="browse">
                                              {/* <input
                                                type="button"
                                                id="get_file"
                                                className="btn-main browse-btn"
                                                value="Browse"
                                                onClick={() => fileRefCollection.current.click()}
                                              /> */}
                                              <label className="c-button btn-main">
                                                Browse
                                                <input
                                                  id="upload_file_Upload_collection"
                                                  type="file"
                                                  ref={fileRefCollection}
                                                  className="btn-main browse-btn"
                                                  required
                                                  onChange={(e) => onCollectionImgChange(e)}
                                                />
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="spacer-20"></div>

                                      <h5 className="createColTitle m-0 required">Title</h5>
                                      <input
                                        type="text"
                                        name="item_title"
                                        value={title}
                                        required
                                        id="item_title"
                                        className="form-control createColInput"
                                        placeholder="e.g. 'Crypto Funk"
                                        onChange={(e) => {
                                          setTitle(e.target.value);
                                        }}
                                      />

                                      <h5 className="createColTitle m-0 required">Symbol</h5>

                                      <input
                                        type="text"
                                        name="item_title"
                                        value={symbol}
                                        required
                                        id="item_title"
                                        className="form-control createColInput"
                                        placeholder="e.g. 'Crypto Funk"
                                        onChange={(e) => {
                                          setSymbol(e.target.value);
                                        }}
                                      />

                                      <h5 className="createColTitle m-0">Description</h5>
                                      <input
                                        type="text"
                                        data-autoresize
                                        name="item_desc"
                                        required
                                        id="item_desc"
                                        value={description}
                                        className="form-control createColInput"
                                        placeholder="e.g. 'This is very limited item'"
                                        onChange={(e) => {
                                          setDescription(e.target.value);
                                        }}
                                      ></input>

                                      <h5 className="createColTitle m-0">Royalties</h5>
                                      <input
                                        type="Number"
                                        name="item_royalties"
                                        min="0"
                                        value={royalty}
                                        required
                                        id="item_royalties"
                                        className="form-control createColInput"
                                        placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 50%"
                                        onChange={(e) => {
                                          if (Number(e.target.value) > 50) {
                                            NotificationManager.error('Percentage should be less than 50%', '', 800);
                                            return;
                                          }
                                          var t = e.target.value;
                                          e.target.value =
                                            t.indexOf('.') >= 0
                                              ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 3)
                                              : t;
                                          setRoyalty(Number(e.target.value));
                                        }}
                                      />

                                      <button
                                        id="submit"
                                        className="btn-main create-collection-btn"
                                        onClick={() => {
                                          handleCollectionCreate();
                                        }}
                                      >
                                        Create Collection
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {collections && collections.length >= 1
                        ? collections.map((collection, index) => {
                            return (
                              <li
                                key={index}
                                id={`my_cus_btn${index}`}
                                className="active"
                                ref={myRef}
                                onClick={(e) => {
                                  handleShow4(collection.sContractAddress, index);
                                  setNextId(collection.nextId);
                                }}
                              >
                                <span className="span-border radio-img">
                                  <img
                                    className="choose-collection-img image"
                                    alt=""
                                    height="10px"
                                    width="10px"
                                    src={`http://${collection.sHash}.ipfs.w3s.link/${collection.sImageName}`}
                                  ></img>
                                  <p className="mt-2 mb-0">{collection.sName}</p>
                                </span>
                              </li>
                            );
                          })
                        : ''}
                    </ul>
                  </div>
                </div>

                <h5 className="required">Upload file</h5>
                <div className="d-create-file">
                  <div className="uploadFile">
                    {' '}
                    <p id="file_name">
                      We recommend an image of at least 450x450.&nbsp; PNG, JPG, GIF or WEBP.&nbsp; Max &nbsp;
                      {MAX_FILE_SIZE}
                      mb.
                    </p>
                  </div>

                  <p>
                    {nftFiles && nftFiles.length > 0 ? (
                      <>
                        {nftFiles[0].name.length > 50
                          ? nftFiles[0].name.slice(0, 10) +
                            nftFiles[0].name.slice(nftFiles[0].name.length - 4, nftFiles[0].name.length)
                          : nftFiles[0].name}
                      </>
                    ) : (
                      ''
                    )}
                  </p>
                  <div className="browse">
                    {/* <input
                      type="button"
                      id="get_file"
                      className="btn-main"
                      value="Browse"
                      onClick={() => fileRef.current.click()}
                    /> */}
                    <label className="c-button btn-main">
                      Browse
                      <input
                        id="upload_file_Upload"
                        type="file"
                        ref={fileRef}
                        className="nftFile"
                        onChange={(e) => onChange(e)}
                      />
                    </label>
                  </div>
                </div>

                <div className="spacer-20"></div>

                <div className="switch-with-title">
                  <h5>
                    <i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>
                    Unlock Once Purchased
                  </h5>
                  <div className="de-switch">
                    <input type="checkbox" id="switch-unlock" className="checkbox" />
                    {isActive ? (
                      <label htmlFor="switch-unlock" onClick={unlockHide}></label>
                    ) : (
                      <label htmlFor="switch-unlock" onClick={unlockClick}></label>
                    )}
                  </div>
                  <div className="clearfix"></div>
                  <p className="p-info pb-3"> Unlock content after successful transaction.</p>

                  {isActive ? (
                    <div id="unlockCtn" className="hide-content">
                      <input
                        type="text"
                        name="item_unlock"
                        id="item_unlock"
                        value={lockedContent}
                        className="form-control"
                        onChange={(e) => setLockedContent(e.target.value)}
                        placeholder="Access key, code to redeem or link to a file..."
                      />
                    </div>
                  ) : null}
                </div>
                <div className="spacer-20"></div>
                <div className="switch-with-title">
                  <h5>
                    <i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>
                    Put on Marketplace
                  </h5>

                  <div className="de-switch">
                    <input type="checkbox" id="switch-unlock1" className="checkbox" checked={isUnlock} />

                    <label htmlFor="switch-unlock1" onClick={clickToUnlock}></label>
                  </div>
                </div>

                <div className="spacer-20"></div>
                {isUnlock ? (
                  <>
                    <div className="spacer-20"></div>
                    <h5>Select method</h5>
                    <div className="de_tab tab_methods">
                      <ul className="de_nav">
                        <li id="btn1" className="active" onClick={handleShow}>
                          <span>
                            <i className="fa fa-tag"></i>Fixed price
                          </span>
                        </li>
                        <li id="btn2" onClick={handleShow1}>
                          <span>
                            <i className="fa fa-hourglass-1"></i>Timed auction
                          </span>
                        </li>
                        <li id="btn3" onClick={handleShow2}>
                          <span>
                            <i className="fa fa-users"></i>Open for bids
                          </span>
                        </li>
                      </ul>

                      <div className="de_tab_content pt-3">
                        <div id="tab_opt_1">
                          <h5 className="required">Price</h5>
                          <input
                            type="text"
                            name="item_price"
                            min="0"
                            max="18"
                            id="item_price"
                            value={price}
                            onKeyPress={(e) => {
                              if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
                            }}
                            onChange={(e) => {
                              if (Number(e.target.value) > 100000000000000) {
                                return;
                              }
                              inputPrice(e);
                            }}
                            className="form-control"
                            placeholder={`0 (${CURRENCY})`}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="de_tab_content">
                  <div id="tab_opt_2" className="hide">
                    <h5 className="required">Minimum bid</h5>
                    <input
                      type="text"
                      min="0"
                      max="18"
                      name="item_price_bid"
                      id="item_price_bid"
                      value={minimumBid}
                      onKeyPress={(e) => {
                        if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(e) => {
                        if (Number(e.target.value) > 100000000000000) {
                          return;
                        }
                        inputPriceAuction(e);
                      }}
                      className="form-control"
                      placeholder="0"
                    />

                    <div className="spacer-20"></div>

                    <div className="row">
                      <div className="col-md-6">
                        <h5 className="required">Payment Token</h5>
                        <select
                          className="form-control selectOpt"
                          onChange={async (e) => {
                            setSelectedTokenAddress(e.target.value);
                            let symbol = getTokenSymbolByAddress(e.target.value);
                            setSelectedTokenSymbol(symbol);
                          }}
                        >
                          {options
                            ? options.map((option, key) => {
                                return <option value={option.value}>{option.title}</option>;
                              })
                            : ''}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <h5 className="required">Expiration date</h5>
                        <input
                          type="datetime-local"
                          id="meeting-time"
                          name="meeting-time"
                          min={getMaxAllowedDate()}
                          className="form-control"
                          onChange={(e) => {
                            setEndTime(new Date(e.target.value));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div id="tab_opt_3" className="hide">
                    <h5 className="required">Minimum bid</h5>
                    <input
                      type="text"
                      name="item_price_bid"
                      min="0"
                      max="18"
                      id="item_price_bid"
                      value={minimumBid}
                      onKeyPress={(e) => {
                        if (!/^\d*\.?\d*$/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(e) => {
                        if (Number(e.target.value) > 100000000000000) {
                          return;
                        }
                        inputPriceAuction(e);
                      }}
                      className="form-control"
                      placeholder="0"
                    />

                    <div className="spacer-20"></div>
                    <div className="col-md-12">
                      <h5 className="required">Payment Token</h5>
                      <select
                        className="form-control selectOpt"
                        onChange={(e) => {
                          setSelectedTokenAddress(e.target.value);
                        }}
                      >
                        {options
                          ? options.map((option, key) => {
                              return <option value={option.value}>{option.title}</option>;
                            })
                          : ''}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="switch-with-title">
                  <h5>
                    <i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>
                    Lazy Minting
                  </h5>

                  <div className="de-switch">
                    <input type="checkbox" id="switch-unlock1" className="checkbox" checked={isLazyMinting} />

                    <label htmlFor="switch-unlock1" onClick={clickToLazyMint}></label>
                  </div>
                </div>

                <div className="spacer-20"></div>
                {/* <div className="spacer-20"></div> */}
                <h5 className="required">Title</h5>
                <input
                  type="text"
                  name="item_title"
                  id="item_title"
                  onChange={(e) => {
                    if (e.target.value.length > 50) {
                      return;
                    }
                    setNftTitle(e.target.value);
                  }}
                  value={nftTitle}
                  className="form-control"
                  placeholder="Crypto"
                />
                <div className="spacer-10"></div>
                <h5>Description</h5>
                <textarea
                  onChange={(e) => {
                    if (e.target.value.length > 250) {
                      return;
                    }
                    setNftDesc(e.target.value);
                  }}
                  value={nftDesc}
                  data-autoresize
                  name="item_desc"
                  id="item_desc"
                  className="form-control"
                  placeholder="My NFT description"
                ></textarea>

                <h5>Quantity</h5>
                <input
                  type="text"
                  name="item_title"
                  min="1"
                  step="1"
                  value={quantity}
                  id="item_title"
                  onKeyPress={(e) => {
                    if (!/^\d*$/.test(e.key)) e.preventDefault();
                  }}
                  onChange={(e) => {
                    const re = new RegExp('^[0-9]*$');
                    let val = e.target.value;
                    if (e.target.value === '' || re.test(e.target.value)) {
                      const numStr = String(val);
                      if (numStr.includes('.')) {
                        if (numStr.split('.')[1].length > 8) {
                        } else {
                          if (val.split('.').length > 2) {
                            val = val.replace(/\.+$/, '');
                          }
                          if (val.length === 2 && val !== '0.') {
                            val = Number(val);
                          }
                          setQuantity(val);
                        }
                      } else {
                        if (val.split('.').length > 2) {
                          val = val.replace(/\.+$/, '');
                        }
                        if (val.length === 2 && val !== '0.') {
                          val = Number(val);
                        }
                        setQuantity(val);
                      }
                    }
                  }}
                  className="form-control"
                  placeholder=""
                />

                <div className="spacer-10"></div>
                <div className={isLazyMinting ? 'hideCollaborator' : 'showCollaborator'}>
                  <h5>Collaborator (Optional)</h5>
                  <input
                    type="text"
                    name="item_collaborator"
                    id="item_collaborator"
                    onChange={(e) => setCurrCollaborator(e.target.value)}
                    value={currCollaborator}
                    className="form-control"
                    placeholder="Please Enter Collaborator's Wallet Address"
                    maxLength={42}
                  />
                  <input
                    type="Number"
                    name="item_collaborator_percent"
                    id="item_collaborator_percent"
                    min="0"
                    value={currCollaboratorPercent}
                    onChange={(e) => {
                      if (Number(e.target.value) > 100) {
                        NotificationManager.error('Invalid Percent', '', 800);
                        return;
                      }
                      var t = e.target.value;
                      e.target.value =
                        t.indexOf('.') >= 0 ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 3) : t;
                      setCurrCollaboratorPercent(e.target.value);
                    }}
                    className="form-control"
                    placeholder="Percent"
                  />
                  <button
                    id="submit"
                    className="btn-main"
                    onClick={() => {
                      handleAddCollaborator();
                    }}
                  >
                    Add Collaborator
                  </button>
                </div>
                <ul>
                  {collaborators && collaboratorPercents
                    ? collaborators.map((collaborator, key) => {
                        return collaborator !== '' ? (
                          <li className="added_collaborator_list">
                            <div className="d-flex justify-content-around align-items-baseline">
                              <h5>
                                {collaborator.slice(0, 5) + '...' + collaborator.slice(38, 42)} :{' '}
                                <span>{collaboratorPercents[key] + '%'}</span>
                              </h5>
                              <button
                                className="remove-btn btn-main"
                                onClick={() => {
                                  handleRemoveCollaborator(key);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ) : (
                          ''
                        );
                      })
                    : ''}
                </ul>

                <button className="btn-main showHideBtn" onClick={() => setIsAdvancedSetting(!isAdvancedSetting)}>
                  {isAdvancedSetting ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                </button>
                {isAdvancedSetting ? PropertiesSection() : ''}
                {isAdvancedSetting ? (
                  <button
                    id="submit"
                    className="btn-main"
                    onClick={() => {
                      handleAddProperty();
                    }}
                  >
                    Add Property
                  </button>
                ) : (
                  ''
                )}
                <div className="spacer-40"></div>
                <div className="nft_attr_section">
                  <div className="row gx-2">
                    {propertyKeys && propertyValues
                      ? propertyKeys.map((propertyKey, key) => {
                          return propertyKey !== '' ? (
                            <div className="col-lg-4 col-md-6 col-sm-6">
                              <div className="createProperty">
                                <div className="nft_attr">
                                  <h5>{propertyKey}</h5>
                                  <h4>{propertyValues[key]}</h4>
                                </div>
                                <button
                                  className="remove-btn btn-main removeBTN"
                                  onClick={() => {
                                    handleRemoveProperty(key);
                                  }}
                                >
                                  <i className="fa fa-trash" aria-hidden="true"></i>
                                </button>
                              </div>
                            </div>
                          ) : (
                            ''
                          );
                        })
                      : ''}
                  </div>
                </div>
                <div className="spacer-10"></div>
                <button
                  id="submit"
                  className="btn-main"
                  onClick={async () => {
                    await handleNftCreation();
                  }}
                >
                  Create NFT
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="preview_section nft__item m-0 position-relative c-items">
              {isTimedAuction ? (
                <div className="de_countdown">
                  <Clock deadline={timeLeft} />
                </div>
              ) : (
                ''
              )}

              <div className="author_list_pp_explore_page author_list_pp">
                <span>
                  <img
                    className="lazy author_image"
                    // /img/author/author-7.jpg
                    src={profilePic ? profilePic : Avatar}
                    alt=""
                  />
                  <i className="fa fa-check profile_img_check"></i>
                </span>
              </div>
              <div className="nft__item_wrap">
                <span className="c-previous-items">
                  <img
                    src={nftImage ? URL.createObjectURL(nftImage) : previewImage}
                    id="get_file_2"
                    className="lazy nft__item_preview slider-img-preview"
                    alt=""
                  />
                </span>
              </div>
              {/* <div className="nft__item_info">
                <span>
                  <h4>{nftTitle ? (nftTitle.length > 15 ? nftTitle.slice(0, 15) + '...' : nftTitle) : 'NFT NAME'}</h4>
                </span>
                <div className="nft__item_price">
                  {isUnlock && price > 0
                    ? price + ' ' + CURRENCY
                    : minimumBid > 0
                    ? minimumBid + ' ' + selectedTokenSymbol
                    : `0 ${selectedTokenSymbol}`}
                </div>
                {/* <div className="nft__item_action">
                  <span>{isOpenForBid ? "Place a bid" : ""}</span>
                </div> */}
              {/* <div className="nft__item_like">
                  <i className="fa fa-heart"></i>
                  <span>0</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        {isShowPopup ? (
          <div className="popup-bg" id="CreateNftLoader">
            <div className="loader_popup-box">
              <div className="row">
                <h2 className="col-12 d-flex justify-content-center mt-2 mb-3">Follow Steps</h2>
              </div>

              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isApprovePopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Approve</h5>
                  <span className="popupText">This transaction is conducted only once per collection</span>
                </div>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isMintPopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Mint</h5>
                  <span className="popupText">Send transaction to create your NFT</span>
                </div>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isRoyaltyPopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Royalty</h5>
                  <span className="popupText">Setting Royalty % for your NFT</span>
                </div>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isUploadPopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Upload</h5>
                  <span className="popupText">Uploading of all media assets and metadata to IPFS</span>
                </div>
              </div>
              {isPutOnMarketplace ? (
                <div className="row customDisplayPopup">
                  <div className="col-3 icontxtDisplayPopup">
                    <div className={isPutOnSalePopupClass}></div>
                  </div>
                  <div className="col-8 icontxtDisplayPopup">
                    <h5 className="popupHeading">Put On Sale</h5>
                    <span className="popupText">Sign message to set fixed price</span>
                  </div>
                </div>
              ) : (
                ''
              )}
              <div className="row customDisplayPopup">
                {hideClosePopup ? (
                  <button className="closeBtn btn-main" disabled={ClosePopupDisabled} onClick={closePopup}>
                    Close
                  </button>
                ) : (
                  ''
                )}
                {hideRedirectPopup ? (
                  <button
                    className="closeBtn btn-main"
                    disabled={RedirectPopupDisabled}
                    onClick={redirectCreateNFTPopup}
                  >
                    Close
                  </button>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </section>
      <Footer />
    </div>
  );
};

export default CreateMultiple;

import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import Clock from '../components/Clock';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import $ from 'jquery';
import Loader from '../components/loader';
import './styles.css';

//*==========

import {
  createNft,
  createOrder,
  getProfile,
  getUsersCollections,
  InsertHistory,
  SetNFTOrder,
  exportInstance,
} from '../../apiServices';
import { handleCollectionCreation, handleBuyNft } from '../../helpers/sendFunctions';
import { getSignature, getMaxAllowedDate } from '../../helpers/getterFunctions';
import { options } from '../../helpers/constants';
import { CURRENCY, GENERAL_DATE, GENERAL_TIMESTAMP } from '../../helpers/constants';
import simplerERC721ABI from '../../Config/abis/simpleERC721.json';
import contracts from './../../Config/contracts';
import { ethers } from 'ethers';
import { connect } from 'react-redux';
import { parseEther } from 'ethers/lib/utils.js';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { Row, Col } from 'react-bootstrap';
import './Create.css';
// import "./App.css";

//!=============

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
  header#myHeader .logo .d-block{
    display: none !important;
  }
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

const Create2 = (props) => {
  const [open, setOpen] = React.useState(false);

  const [file, setFile] = useState();
  const [show3, setShow3] = useState(false);
  const [mint, setMint] = useState(true);
  const [toggle, setToggle] = useState(false);
  const [count, setCount] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [show1, setShow1] = useState(false);

  const [auction, setAuction] = useState(false);
  const [bids, setBids] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  //* ============================================================

  const [nftFiles, setNftFiles] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isUnlock, setIsUnlock] = useState(false);
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState();
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
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
  const [isPutOnMarketplace, setIsPutOnMarketPlace] = useState(false);
  const [chosenType, setChosenType] = useState(0);
  const [minimumBid, setMinimumBid] = useState(0);
  const [endTime, setEndTime] = useState();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState();
  const [isAdvancedSetting, setIsAdvancedSetting] = useState(false);

  /************ Create NFT Popup Checks ********** */
  const [isShowPopup, setisShowPopup] = useState(false);
  const [hideClosePopup, sethideClosePopup] = useState(true);
  const [hideRedirectPopup, sethideRedirectPopup] = useState(false);
  const [ClosePopupDisabled, setClosePopupDisabled] = useState(true);
  const [RedirectPopupDisabled, setRedirectPopupDisabled] = useState(true);

  const [isUploadPopupClass, setisUploadPopupClass] = useState('checkiconDefault');
  const [isApprovePopupClass, setisApprovePopupClass] = useState('checkiconDefault');
  const [isMintPopupClass, setisMintPopupClass] = useState('checkiconDefault');
  const [isRoyaltyPopupClass, setisRoyaltyPopupClass] = useState('checkiconDefault');
  const [isPutOnSalePopupClass, setisPutOnSalePopupClass] = useState('checkiconDefault');
  const [lockedContent, setLockedContent] = useState('');
  const myRef = React.createRef();

  //*=============================================

  function redirectCreateNFTPopup() {
    window.location.href = '/profile';
  }
  function closePopup() {
    onClickRefresh();
  }

  function stopCreateNFTPopup() {
    sethideRedirectPopup(false);
    setClosePopupDisabled(false);
    sethideClosePopup(true);
  }

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

  //*======================

  const handleShow = () => {
    document.getElementById('tab_opt_1').classList.add('show');
    document.getElementById('tab_opt_1').classList.remove('hide');
    document.getElementById('tab_opt_2').classList.remove('show');
    document.getElementById('btn1').classList.add('active');
    document.getElementById('btn2').classList.remove('active');
    document.getElementById('btn3').classList.remove('active');
    setSaleType(0);
    setChosenType(0);
  };
  const handleShow1 = () => {
    document.getElementById('tab_opt_1').classList.add('hide');
    document.getElementById('tab_opt_1').classList.remove('show');
    document.getElementById('tab_opt_2').classList.add('show');
    document.getElementById('btn1').classList.remove('active');
    document.getElementById('btn2').classList.add('active');
    document.getElementById('btn3').classList.remove('active');
    setSaleType(1);
    setChosenType(1);
  };
  const handleShow2 = () => {
    document.getElementById('tab_opt_1').classList.add('show');
    document.getElementById('btn1').classList.remove('active');
    document.getElementById('btn2').classList.remove('active');
    document.getElementById('btn3').classList.add('active');
    setSaleType(1);
    setChosenType(2);
  };
  const handleShow3 = () => {
    document.getElementById('btn4').classList.add('active');
  };
  const handleShow4 = (address, i) => {
    setNftContractAddress(address);
    $('.active').removeClass('clicked');
    $('#my_cus_btn' + i).addClass('clicked');
  };

  const onChange = (e) => {
    var nftFiles = e.target.files;
    var filesArr = Array.prototype.slice.call(nftFiles);
    document.getElementById('file_name').style.display = 'none';
    setNftFiles([...nftFiles, ...filesArr]);
    if (e.target.files && e.target.files[0]) {
      let img = e.target.files[0];

      console.log('nft files is--------->', nftFiles);
      setNftImage(img);
      console.log('nft image is---->', nftImage);
    }
  };
  const togglePopup = () => {
    setIsPopup(!isPopup);
  };

  const unlockClick = () => {
    setIsActive(true);
  };

  const unlockHide = () => {
    setIsActive(false);
  };

  const onCollectionImgChange = (e) => {
    var files = e.target.files;
    var filesArr = Array.prototype.slice.call(files);
    document.getElementById('collection_file_name').style.display = 'none';
    setFiles([...files, ...filesArr]);
    console.log('...files, ...filesArr', e.target.files[0]);
    if (e.target.files && e.target.files[0]) {
      let imgC = e.target.files[0];
      setImage(imgC);
    }
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

  const handleCollectionCreate = async () => {
    try {
      console.log(props);
      if (title === '' || description === '' || image === '' || symbol === '') {
        //console.log("Fill All details");
        console.log('Fill Details');
        return;
      }
      setLoading(true);
      let collectionData = {
        sName: title,
        sDescription: description,
        nftFile: image,
        erc721: JSON.stringify(true),
        sRoyaltyPercentage: Number(royalty) * 100,
        quantity: 1,
        symbol: symbol,
      };
      console.log('collection Data in create Single', collectionData);

      let collectionsList = '';
      try {
        await handleCollectionCreation(true, collectionData, props.account?.account);
        collectionsList = await getUsersCollections();
        console.log(collectionsList);
      } catch (e) {
        setLoading(false);
        return;
      }
      if (collectionsList) {
        collectionsList = collectionsList?.filter((collection) => {
          return collection.erc721 === true;
        });
      }
      console.log('single collectionsList', collectionsList);
      setCollections(collectionsList);
      setLoading(false);
      togglePopup();
    } catch (e) {
      setLoading(false);
      togglePopup();
      console.log(e);
    }
  };

  const validateInputs = () => {
    let sum = 0;
    for (let i = 0; i < collaboratorPercents.length; i++) {
      sum = sum + Number(collaboratorPercents[i]);
    }
    if (sum > 90) {
      console.error('Total percentage should be less than 90');

      return false;
    }
    if (!nftContractAddress) {
      console.error('Please choose valid collection');
      return false;
    }
    console.log(title);
    if (title == '') {
      console.error('Please choose valid title');
      return false;
    }
    return true;
  };

  const handleNftCreation = async () => {
    if (props.account && props.account.account) {
      try {
        console.log('nft image', nftImage);
        let isValid = validateInputs();
        if (!isValid) return;
        console.log('validated input sucessfully');

        // setisShowPopup(true);

        let metaData = [];
        for (let i = 0; i < propertyKeys.length; i++) {
          metaData.push({
            trait_type: propertyKeys[i],
            value: propertyValues[i],
          });
        }

        var fd = new FormData();
        fd.append('metaData', JSON.stringify(metaData));
        fd.append('nCreatorAddress', props.account.account.toLowerCase());
        fd.append('nTitle', nftTitle);
        fd.append('nftFile', nftImage);
        fd.append('nQuantity', quantity);
        fd.append('nCollaborator', [...collaborators]);
        fd.append('nCollaboratorPercentage', [...collaboratorPercents]);
        fd.append('nRoyaltyPercentage', 10);
        fd.append('nCollection', nftContractAddress);
        fd.append('nDescription', nftDesc);
        fd.append('nTokenID', nextId);
        fd.append('nType', 1);
        fd.append('lockedContent', lockedContent);

        setisUploadPopupClass('clockloader');

        let res = await createNft(fd);
        console.log('res========', res);

        try {
          let historyMetaData = {
            nftId: res.result._id,
            userId: res.result.nCreater,
            action: 'Creation',
            actionMeta: 'Default',
            // message: `${props?.profileData?.profileData?.sUserName} Created NFT ${res.data.nTitle}`,
          };

          await InsertHistory(historyMetaData);
        } catch (e) {
          console.log('error in history api', e);
          return;
        }
        // if (res.data) {
        //   setisUploadPopupClass("checkiconCompleted");
        //   setisApprovePopupClass("clockloader");
        // } else {
        //   setisUploadPopupClass("errorIcon");
        //   stopCreateNFTPopup();
        //   return;
        // }

        console.log('nft Address', nftContractAddress);

        const NFTcontract = await exportInstance(nftContractAddress, simplerERC721ABI.abi);
        console.log('NFT Contract', NFTcontract);

        let approval = await NFTcontract.isApprovedForAll(props.account.account, contracts.MARKETPLACE);
        let approvalres;
        const options = {
          from: props.account.account,
          gasPrice: 10000000000,
          gasLimit: 9000000,
          value: 0,
        };
        if (approval) {
          setisApprovePopupClass('checkiconCompleted');
        }
        console.log('approval', approval);
        if (!approval) {
          approvalres = await NFTcontract.setApprovalForAll(contracts.MARKETPLACE, true, options);
          approvalres = await approvalres.wait();
          if (approvalres.status === 0) {
            console.log('Transaction failed');
            return;
          }

          if (approvalres) {
            setisApprovePopupClass('checkiconCompleted');
          } else {
            setisApprovePopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          console.log('Approved');
        }

        setisMintPopupClass('clockloader');
        console.log('To be minted', nextId, GENERAL_TIMESTAMP);
        console.log(props.account.account, nextId, options);

        let res1 = '';
        try {
          let mintres = await NFTcontract.mint(props.account.account, nextId, options);
          res1 = await mintres.wait();
          console.log('Minter properties===>', mintres);
          if (res1.status === 0) {
            NotificationManager.error('Transaction failed');
            console.log('Transaction Failed A');
            return;
          }
        } catch (error) {
          console.log('Mint error', error);
          setisMintPopupClass('errorIcon');
          stopCreateNFTPopup();
          return;
        }

        console.log('collaborators', collaborators);
        let localCollabPercent = [];
        for (let i = 0; i < collaboratorPercents.length; i++) {
          localCollabPercent[i] = Number(collaboratorPercents[i]) * 100;
        }
        if (collaborators.length > 0) {
          try {
            console.log('------>in collaborator', collaboratorPercents);
            let collaborator = await NFTcontract.setTokenRoyaltyDistribution(collaborators, localCollabPercent, nextId);
            // let collaborator = await NFTcontract.setTokenRoyaltyDistribution(
            //   [
            //     "0xa0BB53b41A4BF1524DeD5Ee73aF503a87717a73e",
            //     "0xa3d16efC8cF4F4F1ACEDF6A57cb8ea79bC53d792",
            //   ],
            //   [2500, 2500],
            //   nextId
            // );
            collaborator = await collaborator.wait();
            if (collaborator.status === 0) {
              console.log('Transaction failed');
              return;
            }
            stopCreateNFTPopup();
          } catch (Collerr) {
            console.log('Coll error', Collerr);
            setisRoyaltyPopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          console.log('Collaborator addded');
        }

        setisRoyaltyPopupClass('checkiconCompleted');
        setisPutOnSalePopupClass('clockloader');

        let _deadline;
        let _price;
        let _auctionEndDate;
        console.log('To be minted', nextId, GENERAL_TIMESTAMP);
        // console.log(
        //   "values==========>",
        //   props.account.account.toLowerCase(),
        //   nftContractAddress,
        //   nextId,
        //   quantity,
        //   saleType,
        //   selectedTokenAddress
        //     ? selectedTokenAddress
        //     : "0x0000000000000000000000000000000000000000",
        //   // ethers.utils.parseEther(1.0),
        //   GENERAL_TIMESTAMP,
        //   [],
        //   [],
        //   salt
        // );
        // console.log(chosenType);
        if (chosenType === 0) {
          _deadline = GENERAL_TIMESTAMP;
          _auctionEndDate = GENERAL_DATE;
          _price = ethers.utils.parseEther(price).toString();
          console.log('price==>', _price);
        } else if (chosenType === 1) {
          let _endTime = new Date(endTime).valueOf() / 1000;
          _auctionEndDate = endTime;
          _deadline = _endTime;
          _price = ethers.utils.parseEther(minimumBid).toString();
        } else if (chosenType === 2) {
          _deadline = GENERAL_TIMESTAMP;
          _auctionEndDate = GENERAL_DATE;
          _price = ethers.utils.parseEther(minimumBid).toString();
        }

        console.log(isPutOnMarketplace);
        if (isPutOnMarketplace) {
          let sellerOrder = [
            props.account.account.toLowerCase(),
            nftContractAddress,
            nextId,
            quantity,
            saleType,
            selectedTokenAddress ? selectedTokenAddress : '0x0000000000000000000000000000000000000000',
            _price,
            _deadline,
            [],
            [],
            salt,
          ];

          console.log('sellerOrder is---->', sellerOrder);
          let signature = await getSignature(props.account.account, ...sellerOrder);
          console.log('nftContractAddress is---->', nftContractAddress);
          console.log('signature =========>', signature);

          let reqParams = {
            nftId: res.result._id,
            seller: props.account.account.toLowerCase(),
            tokenAddress: selectedTokenAddress ? selectedTokenAddress : '0x0000000000000000000000000000000000000000',
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
            console.log('propss', props);
            console.log('data========>', data);
            try {
              let historyMetaData = {
                nftId: res.result._id,
                userId: res.result.nCreater,
                action: 'Marketplace',
                actionMeta: 'Default',
                // message: `${props?.profileData?.profileData?.sUserName} Put NFT ${res.data.nTitle} on Marketplace`,
              };

              await InsertHistory(historyMetaData);
              console.log('data inserted sucessfully');
            } catch (e) {
              console.log('error in history api', e);
              return;
            }
          } catch (DataErr) {
            setisPutOnSalePopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          console.log('dataaa', data);
          try {
            await SetNFTOrder({
              orderId: data.results._id,
              nftId: data.results.oNftId,
            });
            console.log('NFT Order set Successfully');
          } catch (NFTErr) {
            console.log('Coll error', NFTErr);
            setisPutOnSalePopupClass('errorIcon');
            stopCreateNFTPopup();
            return;
          }
          setisPutOnSalePopupClass('checkiconCompleted');
          console.log('seller sign', reqParams);
        }
        // window.location.href = "/profile";
      } catch (err) {
        console.log('error', err);
        stopCreateNFTPopup();
        return;
      }
    }
  };

  useEffect(() => {
    setIsOpenForBid(false);
    setIsTimedAuction(false);
    setSaleType(0);
    setQuantity(1);
    setTimeLeft('December, 30, 2022');
    setSalt(Math.round(Math.random() * 10000000));
  }, []);

  useEffect(() => {
    console.log(props.token);
    async function fetchData() {
      if ((props.token && props.token.token) || localStorage.getItem('Authorization')) {
        let collectionsList = await getUsersCollections();
        console.log('single ', collectionsList);
        if (collectionsList)
          collectionsList = collectionsList?.results.filter((results) => {
            return results.erc721 === true;
          });
        console.log('single collectionsList', collectionsList);
        setCollections(collectionsList);
        let profile = await getProfile();
        console.log(profile.sProfilePicUrl);
      }
    }
    if ((props.token && props.token.token) || localStorage.getItem('Authorization')) {
      fetchData();
    }
  }, [props.token]);

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

  return (
    <div>
      <GlobalStyles />
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
                <h1 className="text-center">Create Single NFT</h1>
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
                <h5>Choose Collection</h5>
                <div className="de_tab tab_methods">
                  <div className="scrollable mb-5">
                    <ul className="de_nav" id="custom-create">
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
                              <div className="">
                                <div className="col mb-5">
                                  <h3>Collections</h3>
                                  <div id="form-create-item" className="form-border" action="#">
                                    <div className="collection-field-set">
                                      <h5 className="mb-3">Upload Collection Cover</h5>
                                      <div className="row align-items-center">
                                        <span className="col-md-5 col-sm-12 padding_span text-center">
                                          <img
                                            src={image ? URL.createObjectURL(image) : null}
                                            id="get_file_2"
                                            className=" img-fluid lazy collection_cover_preview"
                                            alt=""
                                          />
                                        </span>

                                        <div className="d-create-file col-md-7">
                                          <p id="collection_file_name">
                                            We recommend an image of at least 300x300. PNG, JPG, GIF, WEBP or MP4. Max
                                            200mb.
                                          </p>
                                          {files
                                            ? files.map((x, index) => (
                                                <>
                                                  <p key={index}>{x.name}</p>
                                                </>
                                              ))
                                            : ''}
                                          <div className="browse">
                                            <input type="button" id="get_file" className="btn-main" value="Browse" />
                                            <input
                                              id="upload_file"
                                              type="file"
                                              required
                                              multiple
                                              onChange={(e) => onCollectionImgChange(e)}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="spacer-20"></div>

                                      <h5 className="m-0">Title</h5>
                                      <input
                                        type="text"
                                        name="item_title"
                                        value={title}
                                        required
                                        id="item_title"
                                        className="form-control collection-input-fields"
                                        placeholder="e.g. 'Crypto Funk"
                                        onChange={(e) => {
                                          setTitle(e.target.value);
                                        }}
                                      />

                                      <div className="spacer-20"></div>

                                      <h5 className="m-0">Symbol</h5>

                                      <input
                                        type="text"
                                        name="item_title"
                                        value={symbol}
                                        required
                                        id="item_title"
                                        className="form-control collection-input-fields"
                                        placeholder="e.g. 'Crypto Funk"
                                        onChange={(e) => {
                                          setSymbol(e.target.value);
                                        }}
                                      />

                                      <div className="spacer-10"></div>

                                      <h5 className="m-0">Description</h5>
                                      <textarea
                                        data-autoresize
                                        name="item_desc"
                                        required
                                        id="item_desc"
                                        value={description}
                                        className="form-control collection-input-fields"
                                        placeholder="e.g. 'This is very limited item'"
                                        onChange={(e) => {
                                          setDescription(e.target.value);
                                        }}
                                      ></textarea>

                                      <div className="spacer-10"></div>

                                      <h5 className="m-0">Royalties</h5>
                                      <input
                                        type="Number"
                                        name="item_royalties"
                                        value={royalty}
                                        required
                                        id="item_royalties"
                                        className="form-control collection-input-fields"
                                        placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%"
                                        onChange={(e) => {
                                          if (Number(e.target.value) > 100) {
                                            console.error('Percentage should be less than 100%');
                                            return;
                                          }
                                          setRoyalty(Number(e.target.value));
                                        }}
                                      />

                                      <div className="spacer-10"></div>

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
                                    height="30px"
                                    width="30px"
                                    // src={`https://ipfs.io/ipfs/${collection.sHash}`}
                                    src={`http://${collection.sHash}.ipfs.w3s.link/${collection.sImageName}`}
                                  ></img>
                                  <p className="mt-2 mb-0" style={{ position: 'relative', bottom: '-6px' }}>
                                    {' '}
                                    {collection.sName}
                                  </p>
                                </span>
                              </li>
                            );
                          })
                        : ''}
                    </ul>
                  </div>
                </div>
                <h5 className="mt-5">Upload file</h5>

                <div className="d-create-file">
                  <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>
                  {nftFiles ? nftFiles.map((x, key) => <p key={key}>{x.name}</p>) : ''}
                  <div className="browse">
                    <input type="button" id="get_file" className="btn-main" value="Browse" />
                    <input id="upload_file" type="file" multiple onChange={(e) => onChange(e)} />
                  </div>
                </div>

                <div className="spacer-single"></div>
                <div className="spacer-20"></div>
                <div className="switch-with-title">
                  <h5>
                    <i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>
                    Unlock once purchased
                  </h5>
                  <div className="de-switch">
                    {' '}
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

                <div className="switch-with-title">
                  <h5>
                    <i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>
                    Put on Marketplace
                  </h5>
                  <div className="de-switch">
                    <input type="checkbox" id="switch-unlock1" className="checkbox" />

                    <label htmlFor="switch-unlock1" onClick={clickToUnlock}></label>
                  </div>
                </div>
                <div className="spacer-single"></div>
                {isUnlock ? (
                  <>
                    {' '}
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
                          <h5>Price</h5>
                          <input
                            type="text"
                            name="item_price"
                            id="item_price"
                            value={price}
                            onChange={(e) => {
                              setPrice(e.target.value);
                            }}
                            className="form-control"
                            placeholder={`enter price for one item (${CURRENCY})`}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                <div className="spacer-single"></div>
                <div className="de_tab_content pt-3">
                  {' '}
                  <div id="tab_opt_2" className="hide">
                    <h5>Minimum bid</h5>
                    <input
                      type="text"
                      name="item_price_bid"
                      id="item_price_bid"
                      value={minimumBid}
                      onChange={(e) => {
                        setMinimumBid(e.target.value);
                      }}
                      className="form-control"
                      placeholder="enter minimum bid"
                    />

                    <div className="spacer-20"></div>
                    <div className="row">
                      <div className="col-md-6">
                        <h5>Payment Token</h5>
                        <select
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
                      <div className="col-md-6">
                        {' '}
                        <h5>Expiration date</h5>
                        <input
                          type="date"
                          name="bid_expiration_date"
                          min={getMaxAllowedDate()}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                          }}
                          id="bid_expiration_date"
                          className="form-control"
                        />{' '}
                      </div>
                    </div>
                  </div>
                  <div id="tab_opt_3" className="hide">
                    <h5>Minimum bid</h5>
                    <input
                      type="Number"
                      name="item_price_bid"
                      id="item_price_bid"
                      value={minimumBid}
                      onChange={(e) => {
                        setMinimumBid(e.target.value);
                      }}
                      className="form-control"
                      placeholder="enter minimum bid"
                    />
                    <div className="spacer-20"></div>
                    <div className="col-md-6">
                      <h5>Payment Token</h5>
                      <select
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

                <div className="spacer-20"></div>

                <h5>Title</h5>
                <input
                  type="text"
                  name="item_title"
                  id="item_title"
                  className="form-control"
                  placeholder="e.g. 'Crypto Funk"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                />

                <div className="spacer-10"></div>

                <h5>Description</h5>
                <textarea
                  data-autoresize
                  name="item_desc"
                  id="item_desc"
                  className="form-control"
                  placeholder="e.g. 'This is very limited item'"
                ></textarea>

                <div className="spacer-10"></div>
                <h5>Collaborator (Optional)</h5>
                <input
                  type="text"
                  name="item_collaborator"
                  id="item_collaborator"
                  onChange={(e) => {
                    if (Number(currCollaboratorPercent) > 90) {
                      console.error('Invalid Percent');
                    }
                    setCurrCollaborator(e.target.value);
                  }}
                  value={currCollaborator}
                  className="form-control"
                  placeholder="Collaborators"
                  maxLength={42}
                />
                <input
                  type="Number"
                  name="item_collaborator_percent"
                  id="item_collaborator_percent"
                  onChange={(e) => {
                    setCurrCollaboratorPercent(e.target.value);
                  }}
                  value={currCollaboratorPercent}
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
                <ul>
                  {collaborators && collaboratorPercents
                    ? collaborators.map((collaborator, key) => {
                        return collaborator !== '' ? (
                          <li className="added_collaborator_list">
                            <div className="d-flex justify-content-around align-items-baseline">
                              <h5>
                                {collaborator.slice(0, 5) + '...' + collaborator.slice(38, 42)} :{' '}
                                <span>{Number(collaboratorPercents[key]) + '%'}</span>
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
                  {isAdvancedSetting ? 'Hide Advanced Setting' : 'Show Advanced Setting'}
                </button>
                {isAdvancedSetting ? PropertiesSection() : ''}
                <button
                  id="submit"
                  className="btn-main"
                  onClick={() => {
                    handleAddProperty();
                  }}
                >
                  Add Property
                </button>
                <ul>
                  {propertyKeys && propertyValues
                    ? propertyKeys.map((propertyKey, key) => {
                        return propertyKey !== '' ? (
                          <li className="added_collaborator_list">
                            <div className="d-flex justify-content-around align-items-baseline">
                              <h5>
                                {propertyKey}: <span>{propertyValues[key]}</span>
                              </h5>
                              <button
                                className="remove-btn btn-main"
                                onClick={() => {
                                  handleRemoveProperty(key);
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
                <div className="spacer-10"></div>

                <div className="spacer-10"></div>

                <button
                  id="submit"
                  className="btn-main"
                  onClick={() => {
                    handleNftCreation();
                  }}
                >
                  Create NFT
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="nft__item m-0 position-relative c-items">
              {/* <div className="de_countdown"></div> */}
              <div className="author_list_pp">
                <span className='c-author-img'>
                  <img className="lazy" src="./img/author/author-1.jpg" alt="" />
                  <i className="fa fa-check"></i>
                </span>
              </div>
              <div className="nft__item_wrap">
                <span>
                  <span className='c-previous-items'>
                    <img
                      src={nftImage ? URL.createObjectURL(nftImage) : ''}
                      id="get_file_2"
                      className="lazy nft__item_preview"
                      alt=""
                    />
                  </span>
                </span>
              </div>
              <div className="nft__item_info">
                <span>
                  <span>
                    <h4>{nftTitle}</h4>
                  </span>
                </span>
                <div className="nft__item_price">{isUnlock && price ? price + ' ' + CURRENCY : ''}</div>
                <div className="nft__item_action">{/* <span>{isOpenForBid ? 'Place a bid' : ''}</span> */}</div>
                <div className="nft__item_like"></div>
              </div>
            </div>
          </div>
        </div>
        {/* {isShowPopup ? (
          <div className="popup-bg" id="CreateNftLoader">
            <div className="loader_popup-box">
              <div className="row">
                <h2 className="col-12 d-flex justify-content-center mt-2 mb-3">
                  Follow Steps
                </h2>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isUploadPopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Upload</h5>
                  <span className="popupText">
                    Uploading of all media assets and metadata to IPFS
                  </span>
                </div>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isApprovePopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Approve</h5>
                  <span className="popupText">
                    This transaction is conducted only once per collection
                  </span>
                </div>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isMintPopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Mint</h5>
                  <span className="popupText">
                    Send transaction to create your NFT
                  </span>
                </div>
              </div>
              <div className="row customDisplayPopup">
                <div className="col-3 icontxtDisplayPopup">
                  <div className={isRoyaltyPopupClass}></div>
                </div>
                <div className="col-8 icontxtDisplayPopup">
                  <h5 className="popupHeading">Royalty</h5>
                  <span className="popupText">
                    Setting Royalty % for your NFT
                  </span>
                </div>
              </div>
              {isPutOnMarketplace ? (
                <div className="row customDisplayPopup">
                  <div className="col-3 icontxtDisplayPopup">
                    <div className={isPutOnSalePopupClass}></div>
                  </div>
                  <div className="col-8 icontxtDisplayPopup">
                    <h5 className="popupHeading">Put on sale</h5>
                    <span className="popupText">
                      Sign message to set fixed price
                    </span>
                  </div>
                </div>
              ) : (
                ""
              )}
              <div className="row customDisplayPopup">
                {hideClosePopup ? (
                  <button
                    className="closeBtn btn-main"
                    disabled={ClosePopupDisabled}
                    onClick={closePopup}
                  >
                    Close
                  </button>
                ) : (
                  ""
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
                  ""
                )}
              </div>
            </div>
          </div>
        ) : (
          ""
        )} */}
      </section>

      <Footer />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    profileData: state.profileData,
  };
};

export default connect(mapStateToProps)(Create2);

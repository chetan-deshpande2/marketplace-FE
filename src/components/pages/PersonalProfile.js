import React, { useState, useEffect, useRef } from 'react';
import ColumnZero from '../components/ColumnZero';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { getProfile } from '../../apiServices';
import Avatar from '../../assets/images/avatar5.jpg';
import { BsPencilSquare } from 'react-icons/bs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { NotificationManager } from 'react-notifications';
import { useCookies } from 'react-cookie';
import ItemNotFound from './ItemNotFound';
import { useNavigate } from '@reach/router';
import '../component-css/profile-page.css';
import Loader from '../components/loader';
import GeneralCollectionsPage from '../components/GenralCollectionPage';

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
    color: rgba(255, 255, 255, .5);;
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

const PersonalProfile = function (props) {
  const [openMenu, setOpenMenu] = useState(true);
  const [openMenu1, setOpenMenu1] = useState(false);
  const [openMenu2, setOpenMenu2] = useState(false);
  const [openMenu3, setOpenMenu3] = useState(false);
  const [openMenu4, setOpenMenu4] = useState(false);
  const [profilePic, setProfilePic] = useState(Avatar);
  const [fullName, setFullName] = useState('Unnamed');
  const [userName, setUserName] = useState('@unnamed');
  const [address, setAddress] = useState('0x0..');
  const [authorization, setAuthorization] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [cookies] = useCookies(['selected_account', 'Authorization']);
  const [paramType, setParamType] = useState(0);

  useEffect(() => {
    setCurrentUser(cookies.selected_account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.selected_account]);

  useEffect(() => {
    setAuthorization(cookies.Authorization);
    setParamType(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.Authorization]);

  useEffect(() => {
    async function fetchData() {
      if (currentUser) {
        setLoading(true);
        const profileInfo = await getProfile();
        console.log(profileInfo);
        if (profileInfo) {
          let profileData = profileInfo;
          if (
            profileData.user.oName &&
            profileData.user.oName.sFirstname &&
            profileData.user.oName.sLastname
          ) {
            setFullName(
              profileData.user.oName.sFirstname +
                ' ' +
                profileData.user.oName.sLastname
            );
          } else {
            setFullName('Unnamed');
          }

          if (profileData.user.sUserName) {
            setUserName('@' + profileData.user.sUserName);
          } else {
            setUserName('@unnamed');
          }

          if (profileData.user.sWalletAddress) {
            setAddress(profileData.user.sWalletAddress);
          } else if (currentUser) {
            setAddress(currentUser);
          } else {
            setAddress('0x0..');
          }

          let sProfilePicUrl =
            profileData.user.sProfilePicUrl === undefined
              ? Avatar
              : profileData.user.sProfilePicUrl;
          setProfilePic(
            'http://bafybeigh5zsvpcywivxin4grse5m6ufu3ptummo722acf7cebwcpadvlq4.ipfs.w3s.link/ca14e04a2ba6d242e822429e84135c63');
          setProfileData(profileData);
          setLoading(false);
        }
      } else {
        setAddress('0x0..');
      }
    }
    fetchData();
  }, [authorization, currentUser]);

  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    setOpenMenu2(false);
    setOpenMenu3(false);
    setOpenMenu4(false);
    document.getElementById('Mainbtn').classList.add('active');
    document.getElementById('Mainbtn1').classList.remove('active');
    // document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById('Mainbtn3').classList.remove('active');
    document.getElementById('Mainbtn4').classList.remove('active');
    setParamType(0);
  };

  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
    setOpenMenu2(false);
    setOpenMenu(false);
    setOpenMenu3(false);
    setOpenMenu4(false);
    document.getElementById('Mainbtn').classList.remove('active');
    document.getElementById('Mainbtn1').classList.add('active');
    // document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById('Mainbtn3').classList.remove('active');
    document.getElementById('Mainbtn4').classList.remove('active');
    setParamType(1);
  };

  const handleBtnClick3 = () => {
    setOpenMenu(false);
    setOpenMenu2(false);
    setOpenMenu1(false);
    setOpenMenu3(!openMenu3);
    setOpenMenu4(false);
    document.getElementById('Mainbtn').classList.remove('active');
    document.getElementById('Mainbtn1').classList.remove('active');
    // document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById('Mainbtn3').classList.add('active');
    document.getElementById('Mainbtn4').classList.remove('active');
    setParamType(3);
  };

  const handleBtnClick4 = () => {
    setOpenMenu(false);
    setOpenMenu2(false);
    setOpenMenu1(false);
    setOpenMenu3(false);
    setOpenMenu4(!openMenu4);
    document.getElementById('Mainbtn').classList.remove('active');
    document.getElementById('Mainbtn1').classList.remove('active');
    // document.getElementById("Mainbtn2").classList.remove("active");
    document.getElementById('Mainbtn3').classList.remove('active');
    document.getElementById('Mainbtn4').classList.add('active');
    setParamType(4);
  };

  return !currentUser ? (
    <ItemNotFound />
  ) : (
    <div>
      {loading ? <Loader /> : ''}
      <GlobalStyles />
      <section
        id='profile_banner'
        className='jumbotron breadcumb no-bg'
        style={{
          backgroundImage: `url(${'./img/background/subheader.jpg'})`,
        }}
      >
        <div className='mainbreadcumb'></div>
      </section>
      <section className='container no-bottom'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='d_profile de-flex'>
              <div className='de-flex-col'>
                <div className='profile_avatar'>
                  <img src={profilePic ? profilePic : ''} alt='' />
                  <i className='fa fa-check'></i>
                  <div className='profile_name'>
                    <h4>
                      <div className='d-flex'>
                        {fullName}
                        <BsPencilSquare
                          className='BsPencilSquare pe-auto'
                          onClick={() => {
                            window.location.href = '/updateProfile';
                          }}
                        />
                      </div>
                      <span className='profile_username'>
                        {userName ? userName : '@unnamed'}
                      </span>
                      <CopyToClipboard
                        text={address}
                        onCopy={() => {
                          NotificationManager.success('Copied!!');
                        }}
                      >
                        <span id='wallet' className='profile_wallet'>
                          {currentUser ? currentUser : '0x0..'}
                        </span>
                      </CopyToClipboard>
                      {/* <CopyToClipboard
                        text={address}
                        onCopy={() => {
                          NotificationManager.success("Copied!!");
                        }}
                      >
                        <button id="btn_copy" title="Copy Text">
                          Copy
                        </button>
                        
                      </CopyToClipboard> */}
                    </h4>
                  </div>
                </div>
              </div>

              {/* <div className="profile_follow de-flex">
                <div className="de-flex-col">
                  <div className="profile_follower">
                    {profileData && profileData.user_followings_size
                      ? profileData.user_followings_size
                      : 0}{" "}
                    followers
                  </div>
                </div>
                <div className="de-flex-col">
                  <div className="profile_follower">
                    {profileData && profileData.user_followers_size
                      ? profileData.user_followers_size
                      : 0}{" "}
                    following
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
      <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='items_filter'>
              <ul className='de_nav text-left'>
                <li id='Mainbtn' className='active'>
                  <span onClick={handleBtnClick}>On Sale</span>
                </li>
                <li id='Mainbtn1' className=''>
                  <span onClick={handleBtnClick1}>Created </span>
                </li>
                {/* <li id="Mainbtn2" className="">
                  <span onClick={handleBtnClick2}>Liked </span>
                </li> */}
                <li id='Mainbtn3' className=''>
                  <span onClick={handleBtnClick3}>Owned </span>
                </li>
                <li id='Mainbtn4' className=''>
                  <span onClick={handleBtnClick4}>Collections </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {openMenu && (
          <div id='zero1' className='onStep fadeIn'>
            <ColumnZero
              isProfile={true}
              paramType={paramType}
              profile={profileData}
            />
          </div>
        )}
        {openMenu1 && (
          <div id='zero2' className='onStep fadeIn'>
            <ColumnZero
              isProfile={true}
              paramType={paramType}
              profile={profileData}
            />
          </div>
        )}
        {openMenu2 && (
          <div id='zero3' className='onStep fadeIn'>
            <ColumnZero
              isProfile={true}
              paramType={paramType}
              profile={profileData}
            />
          </div>
        )}
        {openMenu3 && (
          <div id='zero4' className='onStep fadeIn'>
            <ColumnZero
              isProfile={true}
              paramType={paramType}
              profile={profileData}
            />
          </div>
        )}
        {openMenu4 && (
          <div id='zero5' className='onStep fadeIn'>
            <GeneralCollectionsPage
              userId={profileData?.user._id}
              isAllCollections={false}
            />
          </div>
        )}
      </section>
      )
      <Footer />
    </div>
  );
};

export default PersonalProfile;

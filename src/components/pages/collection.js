import React, { useState, useEffect } from "react";
import CollectionsNfts from "../components/CollectionsNfts";
// import ColumnZeroTwo from "../components/ColumnZeroTwo";
import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import {
  GetCollectionsByAddress,
  GetIndividualAuthorDetail,
  getProfile,
} from "../../apiServices";
import Loader from "../components/loader";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { NotificationManager } from "react-notifications";
import Avatar from "./../../assets/images/avatar5.jpg";
import { useCookies } from "react-cookie";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`;

const Collection = function (props) {
  const [openMenu, setOpenMenu] = useState(true);
  const [openMenu1, setOpenMenu1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authorDetails, setAuthorDetails] = useState(false);
  const [collectionDetails, setCollectionDetails] = useState([]);
  const [profile, setProfile] = useState();
  const [currentUser, setCurrentUser] = useState();
  const [cookies] = useCookies(["selected_account", "Authorization"]);

  useEffect(() => {
    if (cookies.selected_account) setCurrentUser(cookies.selected_account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.selected_account]);

  useEffect(() => {
    const fetch = async () => {
      if (currentUser) {
        let _profile = await getProfile();
        setProfile(_profile);
      }
    };
    fetch();
  }, [currentUser]);

  let { address } = useParams();
  let addr = address;

  useEffect(() => {
    async function fetch() {
      if (addr) {
        setLoading(true);
        let data = await GetCollectionsByAddress({ sContractAddress: addr });
        setCollectionDetails(data);

        setLoading(false);
      }
    }
    fetch();
  }, [addr]);

  useEffect(() => {
    async function fetch() {
      if (collectionDetails) {
        setLoading(true);
        let data = await GetIndividualAuthorDetail({
          userId: collectionDetails.oCreatedBy,
          currUserId: profile ? profile._id : "",
        });
        setAuthorDetails(data);

        setLoading(false);
      }
    }
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionDetails, profile]);

  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
  };
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
    setOpenMenu(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
  };

  return loading ? (
    <Loader />
  ) : (
    <div>
      <GlobalStyles />
      <section
        id="profile_banner"
        className="container jumbotron breadcumb1 no-bg"
        style={{
          backgroundImage: `url(${collectionDetails.collectionImage})`,
        }}
      >
        <div className="mainbreadcumb1"></div>
      </section>

      <section className="container d_coll no-top no-bottom">
        <div className="row">
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                <div className="d_profile_img">
                  <a href={"/author/" + authorDetails._id}>
                    <img
                      src={
                        authorDetails.sProfilePicUrl
                          ? authorDetails.sProfilePicUrl
                          : Avatar
                      }
                      alt=""
                    />
                  </a>
                  <i className="fa fa-check"></i>
                </div>

                <div className="profile_name">
                  <h4>
                    <div className="clearfix">
                      {collectionDetails ? collectionDetails.sName : ""}
                    </div>

                    <CopyToClipboard
                      text={
                        collectionDetails
                          ? collectionDetails.sContractAddress
                          : ""
                      }
                      onCopy={() => {
                        NotificationManager.success("Copied!!");
                      }}
                    >
                      <span id="wallet" className="profile_wallet">
                        {collectionDetails
                          ? collectionDetails.sContractAddress
                          : ""}
                      </span>
                      {/* <button id="btn_copy" title="Copy Text">
                        Copy
                      </button> */}
                    </CopyToClipboard>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container no-top">
        <div className="row">
          <div className="col-lg-12">
            <div className="items_filter">
              <ul className="de_nav">
                <li id="Mainbtn" className="active">
                  <span onClick={handleBtnClick}>On Sale</span>
                </li>
                <li id="Mainbtn1" className="">
                  <span onClick={handleBtnClick1}>Owned</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {openMenu && (
          <div id="zero1" className="onStep fadeIn">
            <CollectionsNfts
              owned={false}
              collection={
                collectionDetails ? collectionDetails.sContractAddress : ""
              }
            />
          </div>
        )}
        {openMenu1 && (
          <div id="zero2" className="onStep fadeIn">
            <CollectionsNfts
              owned={true}
              collection={
                collectionDetails ? collectionDetails.sContractAddress : ""
              }
            />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Collection;

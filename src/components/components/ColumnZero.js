import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Clock from './Clock';
import { getUsersNFTs } from '../../helpers/getterFunctions';
import { connect } from 'react-redux';
import { LikeNft } from '../../apiServices';
import { GENERAL_DATE } from '../../helpers/constants';
import { checkIfLiked } from '../../helpers/getterFunctions';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { Pagination } from '@material-ui/lab';
import Placeholder from './placeholder';
import { perPageCount } from './../../helpers/constants';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const OnSaleItems = (props) => {
  const [nfts, setNfts] = useState([]);
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [totalLikes, setTotalLikes] = useState([]);
  const [likeEvent, setLikeEvent] = useState(false);
  const [currPage, setCurrPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [profile, setProfile] = useState();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetch = async () => {
      console.log(props);
      console.log(props.isAuthor);
      setLoading(true);
      let data;
      if (props.isAuthor) {
        setProfile(props.profile);
        if (props.profile) {
          data = await getUsersNFTs(
            currPage,
            perPageCount,
            props.paramType ? props.paramType : 0,
            props.profile.user ? props.profile.user.sWalletAddress : '',
            props.authorId ? props.authorId : '',
            true,
          );
          if (data === false) {
            setLoading(false);
            return;
          }
        }
      } else {
        console.log('in else block');
        console.log(props.profile);
        if ((props.profile.message = 'user found')) {
          console.log('user found');
          console.log(
            currPage,
            perPageCount,
            props.paramType,
            props.profile.user.sWalletAddress,
            props.profile.user._id,
            false,
          );
          data = await getUsersNFTs(
            currPage,
            perPageCount,
            props.paramType,
            props.profile.user.sWalletAddress,
            props.profile.user._id,
            false,
          );
          console.log(data);
        }
      }

      let localLikes = [];
      let localTotalLikes = [];

      if (data && data.length > 0) {
        setTotalPages(Math.ceil(data[0].count / perPageCount));
        // for (let i = 0; i < data.length; i++) {

        //   localLikes[i] =
        //     props && props.profileData && props.profileData.profileData
        //       ? await checkIfLiked(
        //           data[i]._id,
        //           props.profileData.profileData._id
        //         )
        //       : false;

        //   localTotalLikes[i] = data[i]?.nUser_likes?.length;
        // }
      }
      // setTotalLikes(localTotalLikes);
      // setLikedItems(localLikes);

      setNfts(data);
      setLoading(false);
    };
    fetch();
  }, [props.paramType, props.isAuthor, props, currPage]);

  useEffect(() => {
    async function fetch() {
      let data;

      if (props.isAuthor) {
        if (props.paramType && profile) {
          data = await getUsersNFTs(
            props.paramType ? props.paramType : 0,
            profile ? profile.sWalletAddress : '',
            props.authorId ? props.authorId : '',
            true,
          );
        }
      } else {
        if (props.paramType && profile) {
          data = await getUsersNFTs(props.paramType, profile.sWalletAddress, profile._id, false);
        }
      }
      let localLikes = [];
      let localTotalLikes = [];
      if (data) {
        for (let i = 0; i < data.length; i++) {
          localLikes[i] = profile ? await checkIfLiked(data[i]._id, profile._id) : false;

          localTotalLikes[i] = data[i]?.nUser_likes?.length;
        }
        setTotalLikes(localTotalLikes);
        setLikedItems(localLikes);
      }
    }
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likeEvent, profile]);

  const handleChange = (e, p) => {
    setCurrPage(p);
  };

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  const returnPlaceHolder = () => {
    let ReturnedItem = [];
    if (totalPages > 0)
      for (let i = 0; i < perPageCount; i++) {
        ReturnedItem.push(<Placeholder />);
      }
    return ReturnedItem;
  };

  return (
    <div className="row items-cards">
      {loading
        ? returnPlaceHolder()
        : nfts?.length >= 1
        ? nfts.map((nft, index) => (
            <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4">
              <div className="nft__item m-0">
                {/* {nft.deadline && nft.auction_end_date !== GENERAL_DATE && (
                  <div className="de_countdown">
                    <Clock deadline={nft.auction_end_date} />
                  </div>
                )} */}
                {/* <div className="author_list_pp_explore_page">
                  <span onClick={() => (window.location.href = nft.authorLink)}>
                    <img
                      title={
                        nft.authorAddress ? nft.authorAddress.slice(0, 3) + '...' + nft.authorAddress.slice(39, 42) : ''
                      }
                      className="lazy author_image"
                      src={nft.nTitle}
                      alt=""
                    />
                    <i className="fa fa-check profile_img_check"></i>
                  </span>
                </div> */}

                <div className="author_list_pp_explore_page">
                  {/* <Outer> */}
                    <span onClick={() => (window.location.href = '/itemDetail/' + nft.id)}>
                      <img
                        onLoad={onImgLoad}
                        src={`http://${nft.nHash}.ipfs.w3s.link/${nft.nNftImage}`}
                        className="lazy nft__item_preview slider-img-preview img-fluid"
                        alt=""
                      />
                    </span>
                  {/* </Outer> */}
                </div>
                <div className="nft__item_info mt-3">
                  <span className='text-center' onClick={() => (window.location.href = '/itemDetail/' + nft.id)}>
                    <h4 className="nft_title_class">
                      {nft.title ? (nft.title.length > 15 ? nft.title.slice(0, 15) + '...' : nft.title) : ''}
                    </h4>
                  </span>
                  {/* <div className="nft__item_price">
                    {nft.price ? nft.price : ''}
                    <span>{nft.bid ? nft.bid : ''}</span>
                  </div> */}
                  <div className="nft__item_action">
                    <span onClick={() => (window.location.href = '/itemDetail/' + nft.id)}>
                      {props.isProfile ? 'View NFT' : 'Buy Now'}
                    </span>
                  </div>

                  {/* <div className="spacer-20"></div> */}
                  {/* LIKE START*/}

                  <div className="nft__item_like">
                    {/* {likedItems && likedItems[index] ? (
                      <i
                        id={`item${index}`}
                        style={{ color: "red" }}
                        className="fa fa-heart"
                        onClick={async () => {
                          await LikeNft({ id: nft._id });

                          setLikeEvent(!likeEvent);
                          NotificationManager.success(
                            "Nft disliked successfully"
                          );
                        }}
                      ></i>
                    ) : (
                      <i
                        id={`item${index}`}
                        className="fa fa-heart"
                        onClick={async () => {
                          await LikeNft({ id: nft._id });
                          setLikeEvent(!likeEvent);
                          NotificationManager.success("Nft liked successfully");
                        }}
                      ></i>
                    )}
                    <span id={`totalLikes${index}`}>
                      {totalLikes && totalLikes[index] ? totalLikes[index] : 0}
                    </span> */}
                  </div>

                  {/* LIKE ENDS*/}
                </div>
              </div>
            </div>
          ))
        : ''}
      {totalPages > 1 ? (
        <Pagination
          count={totalPages}
          size="large"
          page={currPage}
          variant="outlined"
          shape="rounded"
          onChange={handleChange}
        />
      ) : (
        ''
      )}
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    token: state.token,
    // profileData: state.profileData,
    // authorData: state.authorData,
  };
};

export default connect(mapStateToProps)(OnSaleItems);

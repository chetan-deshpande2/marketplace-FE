import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Clock from "./Clock";
import { connect } from "react-redux";
import { getUsersNFTs } from "../../helpers/getterFunctions";
import { LikeNft } from "../../apiServices";
import { GENERAL_DATE } from "../../helpers/constants";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const ColumnZero = (props) => {
  const [nfts, setNfts] = useState([]);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      // setLoading(true);
      console.log("props", props);

      let data;

      if (props.isAuthor) {
        console.log("isAuthor11", props);
        if (
          props.paramType &&
          props.authorData &&
          props.authorData.authorData
        ) {
          console.log("isAuthor22", props.isAuthor);
          data = await getUsersNFTs(
            props.paramType ? props.paramType.paramType : 0,
            props.authorData ? props.authorData.authorData.sWalletAddress : "",
            props.authorId ? props.authorId : "",
            true
          );
        }
      } else {
        console.log("in else condn");
        if (
          props.paramType &&
          props.profileData &&
          props.profileData.profileData
        ) {
          data = await getUsersNFTs(
            props.paramType.paramType,
            props.profileData.profileData.sWalletAddress,
            props.profileData.profileData._id,
            false
          );
        }

        console.log("here I am");
      }

      console.log("data in column zero", data);
      // setLoading(false);
      setNfts(data);
    };
    fetch();
  }, [props.paramType, props.authorData, props]);

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  return (
    <div className="row">
      {console.log("nfts?.length", nfts?.length)}
      {nfts?.length >= 1
        ? nfts.map((nft, index) => (
            <div
              key={index}
              className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12"
            >
              <div className="nft__item nft__item1">
                {nft.deadline && nft.auction_end_date !== GENERAL_DATE && (
                  <div className="de_countdown">
                    <Clock deadline={nft.auction_end_date} />
                  </div>
                )}
                <div className="author_list_pp1">
                  <span
                    onClick={
                      (() => (window.location.href = nft.authorLink), "_self")
                    }
                  >
                    <img
                      className="lazy author_list_pp1_img"
                      src={
                        nft.creater
                          ? process.env.IPFS_URL + nft.creater
                          : nft.authorImg
                      }
                      alt=""
                    />
                    <i className="fa fa-check profile_img_check"></i>
                  </span>
                </div>

                <div
                  className="nft__item_wrap"
                  style={{ height: `${height}px` }}
                >
                  <Outer>
                    <span>
                      {console.log("{nft.previewImg}", nft)}
                      <img
                        onLoad={onImgLoad}
                        src={nft.previewImg}
                        className="lazy nft__item_preview"
                        alt=""
                      />
                    </span>
                  </Outer>
                </div>
                <div className="nft__item_info">
                  <span
                    onClick={() =>
                      (window.location.href = "/itemDetail/" + nft.id)
                    }
                  >
                    <h4>{nft.title}</h4>
                  </span>
                  <div className="nft__item_price">
                    {nft.price ? nft.price : ""}
                    <span>{nft.bid ? nft.bid : ""}</span>
                  </div>
                  <div className="nft__item_action">
                    {console.log("nft.id", nft)}
                    <span
                      onClick={() =>
                        (window.location.href = "/itemDetail/" + nft.id)
                      }
                    >
                      Buy Now
                    </span>
                  </div>
                  <div className="nft__item_like">
                    <i
                      className="fa fa-heart"
                      onClick={() => {
                        console.log("nft.id", nft.id);
                        LikeNft({ id: nft.id });
                      }}
                    ></i>
                    <span>{nft.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        : ""}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    paramType: state.paramType,
    profileData: state.profileData,
    authorData: state.authorData,
  };
};

export default connect(mapStateToProps)(ColumnZero);

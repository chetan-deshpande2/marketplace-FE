import React, { Component, useState, useEffect } from "react";
import Slider from "react-slick";
import styled from "styled-components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loader from "./loader";
import { LikeNft } from "../../apiServices";
import { checkIfLiked } from "../../helpers/getterFunctions";
import { GetOnSaleItems } from "../../apiServices";
import Avatar from "./../../assets/images/avatar5.jpg";
import NotificationManager from "react-notifications/lib/NotificationManager";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
`;

class CustomSlide extends Component {
  render() {
    const { index, ...props } = this.props;
    return <div {...props}></div>;
  }
}

const ItemsList = (props) => {
  const [height, setHeight] = useState("0");
  const [items, setItems] = useState([]);
  // const [likedItems, setLikedItems] = useState([]);
  // const [totalLikes, setTotalLikes] = useState([]);
  // const [likeEvent, setLikeEvent] = useState(false);
  // const [likedIndex, setLikedIndex] = useState();
  const [loading, setLoading] = useState(false);

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let searchText = "";
      let saleType = "";
      let itemType = "";
      let reqParam = {
        page: 1,
        limit: 10,
        sortType: -1,
        sTextsearch: searchText,
        sSellingType: props.newItemFilter === "Buy Now" ? 0 : 1,
        itemType: itemType,
      };
      let itemsList = await GetOnSaleItems(reqParam);
      let localLikes = [];
      let localTotalLikes = [];
      if (itemsList && itemsList.results.length > 0) {
        itemsList = itemsList.results[0];
        // for (let i = 0; i < itemsList.length; i++) {
        //   itemsList[i].is_user_like = await checkIfLiked(
        //     itemsList[i]._id,
        //     itemsList[i].nCreater._id
        //   );
        //   localLikes[i] =
        //     props && props.profileData && props.profileData.profileData
        //       ? await checkIfLiked(
        //           itemsList[i]._id,
        //           props.profileData.profileData._id
        //         )
        //       : false;

        //   localTotalLikes[i] = itemsList[i].nUser_likes.length;
        // }
      }
      // setTotalLikes(localTotalLikes);
      // setLikedItems(localLikes);
      setItems(itemsList);
      setLoading(false);
    }
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.newItemFilter]);

  // useEffect(() => {
  //   async function fetch() {
  //     if (props && props.profileData && props.profileData.profileData) {

  //       let reqParam = {
  //         page: 1,
  //         limit: 15,
  //         conditions: {
  //           oStatus: 1,
  //           oType: props.exploreSaleType?.exploreSaleType,
  //         },
  //       };
  //       let itemsList = await GetOnSaleItems(reqParam);
  //       let localLikes = [];
  //       let localTotalLikes = [];
  //       if (itemsList && itemsList.results.length > 0) {
  //         itemsList = itemsList.results[0];
  //         for (let i = 0; i < itemsList.length; i++) {
  //           localLikes[i] = await checkIfLiked(
  //             itemsList[i]._id,
  //             props.profileData.profileData._id
  //           );
  //           localTotalLikes[i] = itemsList[i].nUser_likes.length;
  //         }
  //
  //         setTotalLikes(localTotalLikes);
  //         setLikedItems(localLikes);
  //       }
  //     }
  //   }
  //   fetch();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [likeEvent, likedIndex]);

  var settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 2040,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: false,
        },
      },
      {
        breakpoint: 1900,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: false,
        },
      },
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          infinite: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 320,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
    ],
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="nft">
      <Slider {...settings}>
        {items?.length > 0
          ? items.map((item, key) => {
              return (
                <CustomSlide className="itm" key={key}>
                  <div className="d-item">
                    <div className="nft__item">
                      <div className="author_list_pp">
                        <span
                          onClick={() =>
                            (window.location.href =
                              "/author/" + item.nCreater._id)
                          }
                        >
                          <img
                            title={
                              item.nCreater
                                ? item.nCreater.sWalletAddress?.slice(0, 3) +
                                  "..." +
                                  item.nCreater.sWalletAddress?.slice(39, 42)
                                : ""
                            }
                            className="lazy profile_img"
                            src={
                              item &&
                              item.nCreater &&
                              item.nCreater.sProfilePicUrl
                                ? item.nCreater.sProfilePicUrl
                                : Avatar
                            }
                            alt=""
                          />
                          <i className="fa fa-check"></i>
                        </span>
                      </div>
                      <div
                        className="nft__item_wrap_carausel"
                        style={{ height: `${height}px` }}
                      >
                        <Outer>
                          <span
                            onClick={() =>
                              (window.location.href = `/itemDetail/` + item._id)
                            }
                          >
                            <img
                              src={`${item.nNftImage}`}
                              className="lazy nft__item_preview slider-img-preview"
                              onLoad={onImgLoad}
                              alt=""
                            />
                          </span>
                        </Outer>
                      </div>
                      <div className="nft__item_info">
                        <span
                          onClick={() =>
                            (window.location.href = `/itemDetail/${item._id}`)
                          }
                        >
                          <h4 className="nft_title_class">
                            {item.nTitle
                              ? item.nTitle.length > 15
                                ? item.nTitle.slice(0, 15) + "..."
                                : item.nTitle
                              : ""}
                          </h4>
                        </span>
                        <div className="nft__item_price"></div>
                        <div className="nft__item_action">
                          <span
                            onClick={() =>
                              (window.location.href = `/itemDetail/` + item._id)
                            }
                          >
                            {props.newItemFilter === "On Auction"
                              ? "Place A Bid"
                              : props.newItemFilter}
                          </span>
                        </div>

                        {/* LIKE STARTS */}

                        {/* <div className={"nft__item_like"}>
                          {likedItems && likedItems[key] ? (
                            <i
                              id={`item${key}`}
                              style={{ color: "red" }}
                              className="fa fa-heart"
                              onClick={async () => {
                                await LikeNft({ id: item._id });

                                setLikeEvent(!likeEvent);
                                setLikedIndex(key);
                                NotificationManager.success(
                                  "Nft disliked successfully",
                                  "",
                                  800
                                );
                              }}
                            ></i>
                          ) : (
                            <i
                              id={`item${key}`}
                              className="fa fa-heart"
                              onClick={async () => {
                                await LikeNft({ id: item._id });
                                setLikeEvent(!likeEvent);
                                setLikedIndex(key);
                                NotificationManager.success(
                                  "Nft liked successfully",
                                  "",
                                  800
                                );
                              }}
                            ></i>
                          )}
                          <span id={`totalLikes${key}`}>
                            {totalLikes && totalLikes[key]
                              ? totalLikes[key]
                              : 0}
                          </span>
                        </div> */}

                        {/* LIKE ENDS */}

                        <div className="spacer-20"></div>
                      </div>
                    </div>
                  </div>
                </CustomSlide>
              );
            })
          : ""}
        {items?.length > 0 ? (
          <CustomSlide className="itm">
            <div className="d-item">
              <a href="/explore">
                <div className="nft__item nftItemBox">
                  <div className="author_list_pp d-none">
                    <span></span>
                  </div>
                  <div
                    className="nft__item_wrap_carausel"
                    style={{ height: `${height}px` }}
                  >
                    <Outer>
                      <a href="/explore">View All</a>
                    </Outer>
                  </div>
                  <div
                    className="nft__item_info"
                    style={{ visibility: "hidden" }}
                  >
                    <span>
                      <h4>3</h4>
                    </span>
                    <div className="nft__item_price">1</div>
                    <div className="nft__item_action">
                      <span>3</span>
                    </div>
                    <div className={"nft__item_like"}></div>
                  </div>
                </div>
              </a>
            </div>
          </CustomSlide>
        ) : (
          ""
        )}
      </Slider>
    </div>
  );
};

export default ItemsList;

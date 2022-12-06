import React, { Component, useState, useEffect } from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Loader from './loader';
import { LikeNft } from '../../apiServices';
import { checkIfLiked } from '../../helpers/getterFunctions';
import { GetOnSaleItems } from '../../apiServices';
import Avatar from './../../assets/images/avatar5.jpg';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { useNavigate } from '@reach/router';
import Clock from './Clock';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

var NftPreview = {
  background: 'blue',
  // backgroundImage: "",
};

class CustomSlide extends Component {
  render() {
    const { index, ...props } = this.props;
    return <div {...props}></div>;
  }
}

const CarouselNew = (props) => {
  const [height, setHeight] = useState('0');
  const [items, setItems] = useState([]);
  // const [likedItems, setLikedItems] = useState([]);
  // const [totalLikes, setTotalLikes] = useState([]);
  // const [likeEvent, setLikeEvent] = useState(false);
  // const [likedIndex, setLikedIndex] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  useEffect(() => {
    console.log(items);
  }, [items]);

  useEffect(() => {
    console.log(props.newItemFilter);

    async function fetchData() {
      setLoading(true);
      let searchText = '';
      let saleType = '';
      let itemType = '';
      let reqParam = {
        page: 1,
        limit: 10,
        sortType: -1,
        sTextsearch: searchText,
        sSellingType: props.newItemFilter === 'Buy Now' ? 0 : 1,
        itemType: itemType,
      };
      let itemsList = await GetOnSaleItems(reqParam);
      console.log(itemsList);
      let localLikes = [];
      let localTotalLikes = [];
      if (itemsList && itemsList.results.length > 0) {
        itemsList = itemsList.results;
      }
      setItems(itemsList);

      setLoading(false);
    }

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.newItemFilter]);

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
    <div className="row items-cards">
      {items
        ? items.map((nft, index) => {
            return (
              <div key={index} className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                <div className="nft__item m-0">
                  {' '}
                  {nft.deadline && (
                    <div className="de_countdown">
                      <Clock deadline={nft.nOrders.oValidUpto} />
                    </div>
                  )}
                  <div className="author_list_pp_explore_page">
                    <span
                      onClick={() => {
                        navigate(`/itemDetail/${nft._id}`);
                      }}
                    >
                      <img
                        style={NftPreview}
                        className="lazy "
                        src={`http://${nft.nHash}.ipfs.w3s.link/${nft.nNftImage}`}
                        alt=""
                      />
                    </span>
                  </div>
                  <div
                    // onClick={console.log("nftId===========", nft._id)}
                    onClick={() => navigate(`./itemDetail/${nft._id}`)}
                    className="nft__item_wrap"
                    style={{ height: `${height}px` }}
                  >
                    <Outer>
                      <span>
                        <img
                          onLoad={onImgLoad}
                          src={`http://${nft.sHash}.ipfs.w3s.link/${nft.nNftImage}`}
                          className="lazy nft__item_preview slider-img-preview"
                          alt=""
                        />
                      </span>
                    </Outer>
                  </div>
                  <div className="nft__item_info">
                    <span onClick={() => navigate(`/itemDetail/${nft._id}`)}>
                      <h4>{nft.nTitle}</h4>
                    </span>

                    <div className="nft__item_action">
                      <span onClick={() => navigate(`/itemDetail/${nft._id}`)}>View Item</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        : ''}
    </div>
  );
};

export default CarouselNew;

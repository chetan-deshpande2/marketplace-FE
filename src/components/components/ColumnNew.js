import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Clock from './Clock';
import { GetOnSaleItems, GetSearchedNft, LikeNft } from '../../apiServices';
import { connect } from 'react-redux';
import { useNavigate } from '@reach/router';
import '../../assets/changes.css';

const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https',
  auth: '21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439',
});

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

const ColumnNew = (props) => {
  const [height, setHeight] = useState(0);
  const [items, setItems] = useState([]);
  const [likeEvent, setLikeEvent] = useState(false);
  const navigate = useNavigate();

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  useEffect(() => {
    async function fetch() {
      console.log('propss', props);
      let data;
      let itemsOnSale = [];

      if (!props.searchedData) {
        if (props.exploreSaleType?.exploreSaleType === -1) {
          data = {
            page: 1,
            limit: 10,
            itemType: 1,
            sSellingType: 0,
          };
        } else {
          data = {
            page: 1,
            limit: 10,
            itemType: 1,
            // sSellingType: props.exploreSaleType?.exploreSaleType,
            sSellingType: 0,
          };
        }
        itemsOnSale = await GetOnSaleItems(data);

        let nftType = 1;
        if (nftType !== -1)
          itemsOnSale.results = itemsOnSale.results.filter((item) => {
            return item.nType === nftType;
          });
      } else {
        let reqParams = {
          length: 48,
          start: 0,
          sTextsearch: props.searchedData,
          sSellingType: '',
          sSortingType: '',
          page: 1,
          limit: 10,
        };
        itemsOnSale = await GetSearchedNft(reqParams);
      }
      console.log('itemsOnSale', itemsOnSale.results.length);
      let localRes = [];
      // for (let i = 0; i < itemsOnSale?.results?.length; i++) {
      //   console.log("resssss111", itemsOnSale.results[i].nHash);
      //   let res = await ipfs.cat(itemsOnSale.results[i].nHash);
      //   localRes[i] = res;
      //   console.log("resssss", res);
      //   console.log("File content >> ", JSON.parse(res.toString("utf8")));
      //   console.log("res----->>", res);
      // }

      for (let i = 0; i < itemsOnSale?.results[0]?.length; i++) {
        itemsOnSale.results[i].imageHash = JSON.parse(localRes[i].toString('utf8')).image;
      }

      setItems(itemsOnSale && itemsOnSale.results ? itemsOnSale.results : []);
    }

    fetch();
  }, [props]);
  return (
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
                        src={
                          nft.nCreater?.sProfilePicUrl
                            ? 'https://gateway.pinata.cloud/ipfs/QmdaGBG8mjZgkg3Z2uvzJ57tdGTJscSGJcuR3fxqdtJbmM' +
                              nft.nCreater.sProfilePicUrl
                            : 'https://gateway.pinata.cloud/ipfs/QmdaGBG8mjZgkg3Z2uvzJ57tdGTJscSGJcuR3fxqdtJbmM'
                        }
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
                          src={nft.imageHash}
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
                    <div className="nft__item_price">
                      {/* {convertToEth(nft?.nOrders[0]?.oPrice.$numberDecimal)} ETH */}
                    </div>
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

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    paramType: state.paramType,
    profileData: state.profileData,
    authorData: state.authorData,
  };
};

export default connect(mapStateToProps)(ColumnNew);

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Clock from "./Clock";
import { GetOnSaleItems, GetSearchedNft, LikeNft } from "../../apiServices";
import { connect } from "react-redux";
import { useNavigate } from "@reach/router";
// import ReactDOM from 'react-dom';
import ReactPaginate from "react-paginate";
// import Pagination from './Pagination.js';

const ipfsAPI = require("ipfs-api");

const ipfs = ipfsAPI("ipfs.infura.io", "5001", {
  protocol: "https",
  auth: "21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439",
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
  background: "red",
  // backgroundImage: "",
};

function ColumnNew (props, itemsPerPage){
  const [height, setHeight] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

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
      console.log("propss", props);
      let data;
      let itemsOnSale = [];

      if (!props.searchedData) {
        if (props.exploreSaleType?.exploreSaleType === -1) {
          data = {
            page: 1,
            limit: 9,
            itemType: 1,
            sSellingType: 0,
          };
        } else {
          data = {
            page: 1,
            limit: 9,
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
          sSellingType: "",
          sSortingType: "",
          page: 1,
          limit: 4,
        };
        itemsOnSale = await GetSearchedNft(reqParams);
      }
      console.log("itemsOnSale", itemsOnSale.results.length);
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
        itemsOnSale.results[i].imageHash = JSON.parse(
          localRes[i].toString("utf8")
        ).image;
      }

      setItems(itemsOnSale && itemsOnSale.results ? itemsOnSale.results : []);
    }

    fetch();
  }, [props]);
  const endOffset = itemOffset + 4;
  console.log(`Loading items from ${itemOffset} to ${endOffset}`);

  const pages = items;
  const pageCount = Math.ceil(pages.length / 4);
  console.log(pageCount);

  const handlePageClick = (event) => {
    console.log(event);
    const newOffset = (event.selected * 4) % items.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  return (
    <><div className="row">
      {items
        ? items.map((nft, index) => {
          return (
            <div
              key={index}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"
            >
              <div className="nft__item m-0">
                {" "}
                {nft.deadline && (
                  <div className="de_countdown">
                    <Clock deadline={nft.nOrders.oValidUpto} />
                  </div>
                )}
                <div className="author_list_pp_explore_page">
                  <span
                    onClick={() => {
                      navigate(`/itemDetail/${nft.nCreater._id}`);
                    } }
                  >
                    <img
                      style={NftPreview}
                      className="lazy "
                      src={nft.nCreater?.sProfilePicUrl
                        ? "https://gateway.pinata.cloud/ipfs/QmdaGBG8mjZgkg3Z2uvzJ57tdGTJscSGJcuR3fxqdtJbmM" +
                        nft.nCreater.sProfilePicUrl
                        : "https://gateway.pinata.cloud/ipfs/QmdaGBG8mjZgkg3Z2uvzJ57tdGTJscSGJcuR3fxqdtJbmM"}
                      alt="" />
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
                        alt="" />
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
                    <span onClick={() => navigate(`/itemDetail/${nft._id}`)}>
                      View Item
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
        : ""}

      {/* <ColumnNew itemsPerPage={4} /> */}
    </div><ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        Displayed Page Range={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null} /></>  
  );
};


// ReactDOM.render(
//   <ColumnNew itemsPerPage={4} />,
//   document.getElementById('container')
// );
export default ColumnNew;

import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";

import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import { connect } from "react-redux";
import { exploreSaleTypeUpdated } from "../../redux/actions";
import styled from "styled-components";
import Clock from "../components/Clock";
import { GetOnSaleItems, GetSearchedNft } from "../../apiServices";
import { useNavigate } from "@reach/router";

import ReactPaginate from "react-paginate";
import Loader from "../components/loader";
import "../../assets/changes.css";

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

const itemPerPage = 4;

var NftPreview = {
  background: "red",
};
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

const customStyles = {
  option: (base, state) => ({
    ...base,
    background: "#fff",
    color: "#333",
    borderRadius: state.isFocused ? "0" : 0,
    "&:hover": {
      background: "#eee",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    marginTop: 0,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  control: (base, state) => ({
    ...base,
    padding: 2,
  }),
};

const options = [
  { value: "All categories", label: "All categories" },
  { value: "Art", label: "Art" },
  { value: "Music", label: "Music" },
  { value: "Domain Names", label: "Domain Names" },
];
const options1 = [
  { value: "All Sale Type", label: "All Sale Type" },
  { value: "Buy Now", label: "Buy Now" },
  { value: "On Auction", label: "On Auction" },
  { value: "Floor Price Bid", label: "Floor Price Bid" },
];
const options2 = [
  { value: "All Items", label: "All Items" },
  { value: "Single Items", label: "Single Items" },
  { value: "Multiple Items", label: "Multiple Items" },
];

const Explore = (props) => {
  const [saleType, setSaleType] = useState(-1);
  

  useEffect(() => {
    props.dispatch(
      exploreSaleTypeUpdated({
        exploreSaleType: saleType,
      })
    );
  }, [saleType]);

  const [height, setHeight] = useState(0);
  const [items, setItems] = useState([]);
  const [countItem, setCountItem] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  const fetch = useCallback(async (_page_no = 1) => {
    setLoading(true);
    let data;
    let itemsOnSale = [];

    if (!props.searchedData) {
      if (props.exploreSaleType?.exploreSaleType === -1) {
        data = {
          page: _page_no,
          limit: itemPerPage,
          itemType: 1,
          sSellingType: 0,
        };
      } else {
        data = {
          page: _page_no,
          limit: itemPerPage,
          itemType: 1,
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
        page: _page_no,
        limit: 4,
      };
      itemsOnSale = await GetSearchedNft(reqParams);
    }
    setCountItem(itemsOnSale?.count / itemPerPage);
    let localRes = [];
    for (let i = 0; i < itemsOnSale?.results[0]?.length; i++) {
      itemsOnSale.results[i].imageHash = JSON.parse(
        localRes[i].toString("utf8")
      ).image;
    }
    setItems(itemsOnSale && itemsOnSale.results ? itemsOnSale.results : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [props]);

  const handlePageClick = (page_no) => {
    let page_no_val = page_no?.selected;
    fetch(page_no_val + 1);
  };

  return (
    <div>
      <GlobalStyles />

      <section
        className="jumbotron breadcumb no-bg"
        style={{ backgroundImage: `url(${"./img/background/subheader.jpg"})` }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Explore</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="items_filter">
              <form
                className="row form-dark"
                id="form_quick_search"
                name="form_quick_search"
              >
                <div className="col">
                  <input
                    className="form-control"
                    id="name_1"
                    name="name_1"
                    placeholder="search item here..."
                    type="text"
                  />{" "}
                  <button id="btn-submit">
                    <i className="fa fa-search bg-color-secondary"></i>
                  </button>
                  <div className="clearfix"></div>
                </div>
              </form>
              <div className="dropdownSelect one">
                <Select
                  styles={customStyles}
                  menuContainerStyle={{ zIndex: 999 }}
                  defaultValue={options[0]}
                  options={options}
                />
              </div>
              <div className="dropdownSelect two">
                <Select
                  styles={customStyles}
                  defaultValue={options1[0]}
                  options={options1}
                />
              </div>
              <div className="dropdownSelect three">
                <Select
                  styles={customStyles}
                  defaultValue={options2[0]}
                  options={options2}
                />
              </div>
            </div>
          </div>
        </div>

        <>
          <div className="row">
            {!loading && items
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
                            }}
                          >
                            <img
                              style={NftPreview}
                              className="lazy "
                              src={
                                nft.nCreater?.sProfilePicUrl
                                  ? "https://gateway.pinata.cloud/ipfs/QmdaGBG8mjZgkg3Z2uvzJ57tdGTJscSGJcuR3fxqdtJbmM" +
                                    nft.nCreater.sProfilePicUrl
                                  : "https://gateway.pinata.cloud/ipfs/QmdaGBG8mjZgkg3Z2uvzJ57tdGTJscSGJcuR3fxqdtJbmM"
                              }
                              alt=""
                            />
                          </span>
                        </div>
                        <div
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
                          <span
                            onClick={() => navigate(`/itemDetail/${nft._id}`)}
                          >
                            <h4>{nft.nTitle}</h4>
                          </span>
                          <div className="nft__item_price"></div>
                          <div className="nft__item_action">
                            <span
                              onClick={() => navigate(`/itemDetail/${nft._id}`)}
                            >
                              View Item
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : ""}

            {loading && <Loader />}

          </div>

          <ReactPaginate
            previousLabel="Previous"
            nextLabel="Next"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active"
            onPageChange={handlePageClick}
            Displayed
            Page
            Range={itemPerPage}
            pageCount={countItem}
            renderOnZeroPageCount={null}
          />
        </>
      </section>

      <Footer />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    exploreSaleType: state.exploreSaleType,
  };
};

export default connect(mapStateToProps)(Explore);

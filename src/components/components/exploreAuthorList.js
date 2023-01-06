import React, { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from "styled-components";
import { connect } from "react-redux";
import { isEmpty } from "../../helpers/getterFunctions";
import { Pagination } from "@material-ui/lab";
// import Placeholder from "./placeholder";
import { GetAllUserDetails } from "./../../apiServices";
import Avatar from "./../../assets/images/avatar5.jpg";
import Loader from "./loader";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const ExploreAuthorsList = (props) => {
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState([]);

  const [currPage, setCurrPage] = useState(1);
  const perPageCount = 12;
  const [totalPages, setTotalPages] = useState(0);

  const onImgLoad = ({ target: img }) => {
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      let searchText = "";
      if (props.searchedData) {
        searchText = props.searchedData;
      }
      setLoading(true);
      let searchData = {
        page: currPage,
        limit: perPageCount,
        sTextsearch: searchText
      };
      let _authors = await GetAllUserDetails(searchData);
      setAuthors(_authors.results[0]);
      setTotalPages(Math.ceil(_authors.count / perPageCount));
      setLoading(false);
    }

    fetchData();
  }, [props, props._authors, currPage, props.searchBtnClick]);

  const handleChange = (e, p) => {
    setCurrPage(p);
  };

  //   const returnPlaceHolder = () => {
  //     let ReturnedItem = [];
  //     if (totalPages > 0)
  //       for (let i = 0; i < perPageCount; i++) {
  //         ReturnedItem.push(<Placeholder />);
  //       }
  //     return ReturnedItem;
  //   };

  return loading ? (
    <Loader />
  ) : (
    <div className="row">
      {authors?.length >= 1 && !isEmpty(authors[0])
        ? authors.map((author, index) => (
            <div
              key={index}
              className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12"
            >
              <div className="nft__item">
                <div
                  className="nft__item_wrap"
                  style={{ height: `${height}px` }}
                >
                  <Outer>
                    <span
                      onClick={() =>
                        (window.location.href = "author/" + author._id)
                      }
                    >
                      <img
                        onLoad={onImgLoad}
                        src={
                          author.sProfilePicUrl ? author.sProfilePicUrl : Avatar
                        }
                        className="lazy nft__item_preview slider-img-preview"
                        alt=""
                      />
                    </span>
                  </Outer>
                </div>
                <div className="nft__item_info col_info">
                  <span
                    onClick={() =>
                      (window.location.href = "author/" + author._id)
                    }
                  >
                   
                    <span className="authorName">
                      {author.oName
                        ? author.oName.sFirstname +
                            " " +
                            author.oName.sLastname
                           
                        : "@unnamed"}
                    </span>
                    <h4 className="walletAddress">
                      {author.sWalletAddress
                        ? author.sWalletAddress.slice(0, 6) + "..."
                        : "0x0.."}
                    </h4>
                  </span>
                </div>
              </div>
            </div>
          ))
        : ""}
        <div className="col-lg-12">
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
            ""
          )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    token: state.token,
  };
};

export default connect(mapStateToProps)(ExploreAuthorsList);

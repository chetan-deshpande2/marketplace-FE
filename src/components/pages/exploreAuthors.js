// eslint-disable array-callback-return

import React, { useState } from "react";
import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import { connect } from "react-redux";
import ExploreAuthorsList from "./../components/exploreAuthorsList";

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

const ExploreAuthors = (props) => {
  const [searchedData, setSearchedData] = useState("");
  const [searchBtnClick, setSearchBtnClick] = useState(false);

  const handleSearch = (e) => {
    setSearchedData(e.target.value);
  };

  return (
    <div>
      <GlobalStyles />

      <section
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${"./img/background/Rectangle11.png"})`,
        }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center explore-heading">Authors</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="items_filter">
              <div
                className="row form-dark"
                id="form_quick_search"
                name="form_quick_search"
              >
                <div className="col">
                  <input
                    className="form-control"
                    id="name_1"
                    name="name_1"
                    placeholder="Search Author Here..."
                    type="text"
                    autocomplete="off"
                    value={searchedData}
                    onChange={(e) => {
                      handleSearch(e);
                    }}
                  />{" "}
                  <button
                    id="btn-submit"
                    onClick={() => {
                      setSearchBtnClick(!searchBtnClick);
                    }}
                  >
                    <i className="fa fa-search bg-color-secondary"></i>
                  </button>
                  <div className="clearfix"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ExploreAuthorsList
          searchedData={searchedData}
          searchBtnClick={searchBtnClick}
        />
      </section>

      <Footer />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    token: state.token,
  };
};

export default connect(mapStateToProps)(ExploreAuthors);

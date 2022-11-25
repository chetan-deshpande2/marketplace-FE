import React, { useState, useEffect } from "react";
import Select from "react-select";
import ColumnNew from "../components/ColumnNew";
import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import { connect } from "react-redux";
import { exploreSaleTypeUpdated } from "../../redux/actions";

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
  const [nftType, setNftType] = useState(-1);
  const [searchedData, setSearchedData] = useState("");

  useEffect(() => {
    props.dispatch(
      exploreSaleTypeUpdated({
        exploreSaleType: saleType,
      })
    );
  }, [saleType]);

  const handleSaleTypeChange = (e) => {
    console.log("ee", e);

    console.log("valuee", e.value);
    if (e.value === "All Sale Type") {
      setSaleType(-1);
      props.dispatch(
        exploreSaleTypeUpdated({
          exploreSaleType: -1,
        })
      );
    } else if (e.value === "Buy Now") {
      setSaleType(0);
      props.dispatch(
        exploreSaleTypeUpdated({
          exploreSaleType: 0,
        })
      );
    } else if (e.value === "On Auction") {
      setSaleType(1);
      props.dispatch(
        exploreSaleTypeUpdated({
          exploreSaleType: 1,
        })
      );
    } else if (e.value === "Floor Price Bid") {
      setSaleType(2);
      props.dispatch(
        exploreSaleTypeUpdated({
          exploreSaleType: 2,
        })
      );
    }
  };

  const handleNftTypeChange = (e) => {
    console.log("ee", e);

    console.log("valuee", e.value);
    if (e.value === "All Items") {
      setNftType(-1);
    } else if (e.value === "Single Items") {
      setNftType(1);
    } else if (e.value === "Multiple Items") {
      setNftType(2);
    }
  };

  const handleSearch = (e) => {
    setSearchedData(e.target.value);
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
        <ColumnNew
          saleType={saleType}
          nftType={nftType}
          searchedData={searchedData}
        />
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

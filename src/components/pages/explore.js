// eslint-disable array-callback-return

import React, { useState } from 'react';
import Select from 'react-select';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { connect } from 'react-redux';
import GeneralCollectionsPage from '../components/GenralCollectionPage';
import CarouselNew from '../components/CarouselNew';

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
  // header#myHeader .logo .d-block{
  //   display: none !important;
  // }
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
    background: '#fff',
    color: '#333',
    borderRadius: state.isFocused ? '0' : 0,
    '&:hover': {
      background: '#eee',
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
  { value: 'All Collections', label: 'All Collections' },
  { value: 'Single Collections', label: 'Single Collections' },
  { value: 'Multiple Collections', label: 'Multiple Collections' },
];

const ExploreCollections = (props) => {
  const [nftType, setNftType] = useState(-1);
  const [searchedData, setSearchedData] = useState('');
  const [searchBtnClick, setSearchBtnClick] = useState(false);
  const [newItemFilter, setNewItemFilter] = useState('Buy Now');

  const handleNftTypeChange = (e) => {
    if (e.value === 'All Collections') {
      setNftType(-1);
    } else if (e.value === 'Single Collections') {
      setNftType(1);
    } else if (e.value === 'Multiple Collections') {
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
        style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}
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
              <div className="row form-dark" id="form_quick_search" name="form_quick_search">
                <div className="col">
                  <input
                    className="form-control"
                    id="name_1"
                    name="name_1"
                    placeholder="Search Collections Here..."
                    type="text"
                    value={searchedData}
                    autocomplete="off"
                    onChange={(e) => {
                      handleSearch(e);
                    }}
                  />{' '}
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
              {/* <div className="dropdownSelect one">
                <Select
                  styles={customStyles}
                  menuContainerStyle={{ zIndex: 999 }}
                  defaultValue={options[0]}
                  options={options}
                />
              </div> */}

              <div className="dropdownSelect three">
                <Select
                  styles={customStyles}
                  defaultValue={options[0]}
                  options={options}
                  onChange={(e) => handleNftTypeChange(e)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* <GeneralCollectionsPage
          isAllCollections={true}
          isERC721={nftType !== '' ? (nftType === 1 ? true : nftType === 2 ? false : '') : ''}
          searchedData={searchedData}
        /> */}
        <div className="col-lg-12">
          <CarouselNew newItemFilter={newItemFilter} />
        </div>
        {/* <ExploreItems
          saleType={saleType}
          nftType={nftType}
          searchedData={searchedData}
          searchBtnClick={searchBtnClick}
        /> */}
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

export default connect(mapStateToProps)(ExploreCollections);

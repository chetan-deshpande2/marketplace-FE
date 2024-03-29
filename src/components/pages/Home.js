import React, { useState, useEffect } from 'react';
import Particle from '../components/Particle';
import SliderMainParticle from '../components/SliderMainParticle';
import FeatureBox from '../components/FeatureBox';
import CarouselCollection from '../components/CarouselCollection';
// import ColumnNew from '../components/ColumnNew';
import AuthorList from '../components/authorList';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { KeyboardArrowRight } from '@material-ui/icons';
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
    color: #fff;
  }
  // header#myHeader .logo .d-block{
  //   display: none !important;
  // }
  // header#myHeader .logo .d-none{
  //   display: block !important;
  // }
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

const Home = () => {
  const [newItemFilter, setNewItemFilter] = useState('Buy Now');
  const [isDropDown, setIsDropDown] = useState(false);

  return (
    <div>
      {' '}
      <GlobalStyles />
      <section className="jumbotron no-bg" style={{ backgroundImage: `url(${'./img/background/2.jpg'})` }}>
        <Particle />
        <SliderMainParticle />
      </section>
      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12 ">
            <div className="text-center newItemsHeader">
              <h2>New Items</h2>
              <div className="small-border"></div>
            </div>
            {/* <div className="selectItem-dropdown">
              <div className="dropdown-box" onClick={() => setIsDropDown(!isDropDown)}>
                <span>Sale Type</span>
                {newItemFilter} {!isDropDown ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              </div>
              <ul className={!isDropDown ? 'hidden' : 'dropdown-list shadow-lg'}>
                <li
                  onClick={() => {
                    setNewItemFilter('Buy Now');
                    setIsDropDown(!isDropDown);
                  }}
                >
                  Buy Now
                </li>
                <li
                  onClick={() => {
                    setNewItemFilter('On Auction');
                    setIsDropDown(!isDropDown);
                  }}
                >
                  On Auction
                </li>
              </ul>
            </div> */}
          </div>

          <div className="col-lg-12">
            <CarouselNew newItemFilter={newItemFilter} />
          </div>
        </div>
      </section>
      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <AuthorList />
          </div>
        </div>
      </section>
      <section className="container-fluid bg-gray">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Create and sell your NFTs</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        <div className="container">
          <FeatureBox />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;

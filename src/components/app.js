import React from 'react';
import { Router, Location, Redirect } from '@reach/router';

import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';

import Home1 from './pages/home1';

import Explore from './pages/explore';
import Explore2 from './pages/explore2';

import Auction from './pages/Auction';
import ItemDetail from './pages/ItemDetail';
// import Author from "./pages/Author";

import Create2 from './pages/create2';
import Create3 from './pages/create3';
import Createoption from './pages/createOptions';

import PersonalProfile from './pages/PersonalProfile';
import UpdateProfile from './pages/updateProfile';
import ItemNotFound from './pages/ItemNotFound';
// import ItemDetails2 from './pages/ItemDetail2';

import { createGlobalStyle } from 'styled-components';
import { NotificationContainer } from 'react-notifications';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0, 0), [location]);
  return children;
};

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id="routerhang">
        <div key={location.key}>
          <Router location={location}>{children}</Router>
        </div>
      </div>
    )}
  </Location>
);

const app = () => (
  <div className="wraper">
    <GlobalStyles />
    <Header />
    <PosedRouter>
      <ScrollTop path="/">
        {/* <Home exact path="/">
          <Redirect to="/home1" />
        </Home> */}
        <Home1 path="/" />

        <Explore path="/explore" />
        <Explore2 path="/explore2" />

        <Auction path="/Auction" />

        <ItemDetail path="/itemDetail/:id" />

        {/* <ItemDetails2 path="/itemDetail2/:id" /> */}

        <UpdateProfile path="/updateProfile" />
        <PersonalProfile path="/personalProfile" />
        {/* <Author path="/Author" /> */}
        <Createoption path="/createOptions" />
        <Create2 path="/create2" />
        <Create3 path="/create3" />

        <ItemNotFound path="*" element={ItemNotFound} />
      </ScrollTop>
    </PosedRouter>
    <ScrollToTopBtn />
    <NotificationContainer />
  </div>
);

export default app;

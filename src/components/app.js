import React from 'react';
import { Router, Location } from '@reach/router';
import { createGlobalStyle } from 'styled-components';

import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home from './pages/Home';
import Explore from './pages/explore';
import Auction from './pages/Auction';
import ItemDetail from './pages/ItemDetail';
import CreateSingle from './pages/createSingle';
import CreateMultiple from './pages/createMultiple';
import CreateOption from './pages/createOptions';
import PersonalProfile from './pages/PersonalProfile';
import UpdateProfile from './pages/updateProfile';
import ItemNotFound from './pages/ItemNotFound';

import 'react-notifications/lib/notifications.css';
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
        <Home path="/" />
        <Explore path="/explore" />
        <CreateOption path="/createOptions" />
        <CreateSingle path="/createSingle" />
        <CreateMultiple path="/createMultiple" />
        <Auction path="/Auction" />
        <ItemDetail path="/itemDetail/:id" />
        <UpdateProfile path="/updateProfile" />
        <PersonalProfile path="/personalProfile" />
        <ItemNotFound path="*" element={ItemNotFound} />
      </ScrollTop>
    </PosedRouter>
    <ScrollToTopBtn />
    <NotificationContainer />
  </div>
);

export default app;

import React from "react";
import { Router, Location } from "@reach/router";
import { connect } from "react-redux";
import ScrollToTopBtn from "./menu/ScrollToTop";
import Header from "./menu/header";
import Home1 from "./pages/home1";

import Explore from "./pages/explore";

import ItemDetail from "./pages/ItemDetail";

import Create from "./pages/create";
import Create2 from "./pages/create2";
import Create3 from "./pages/create3";
import Createoption from "./pages/createOptions";

import PersonalProfile from "./pages/PersonalProfile";
import UpdateProfile from "./pages/updateProfile";

import { createGlobalStyle } from "styled-components";

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
        <Home1 path="/" />

        <Explore path="/explore" />

        <ItemDetail path="/itemDetail/:id" />

        <UpdateProfile path="/updateProfile" />

        <PersonalProfile path="/personalProfile" />

        <Create path="/create" />
        <Create2 path="/create2" />
        <Create3 path="/create3" />
        <Createoption path="/createOptions" />
      </ScrollTop>
    </PosedRouter>
    <ScrollToTopBtn />
  </div>
);

const mapStateToProps = (state) => {
  return {
    account: state.account,
    token: state.token,
    paramType: state.paramType,
    profileData: state.profileData,
    authorData: state.authorData,
  };
};

export default connect(mapStateToProps)(app);

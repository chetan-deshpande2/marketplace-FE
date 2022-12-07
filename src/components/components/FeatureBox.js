import React from "react";
import Reveal from "react-awesome-reveal";
import { keyframes } from "@emotion/react";
import CollectionImage from "../../assets/images/react-1.svg";
import CollectionBottomImg from "../../assets/images/react-bg.svg";

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;

const FeatureBox = () => (
  <div className="row c-tabs-nft">
    {/* <h1 className="Create-sell-h1">How it works.</h1> */}
    <div className="col-lg-12">
      <div className="text-center">
        <h2>How it works</h2>
        <div className="small-border"></div>
      </div>
    </div>
    <div
      // onClick={() => (window.location.href = "/wallet")}
      className="col-xl-3 col-lg-6 col-md-6 mb-3"
    >
      <div className="feature-box f-boxed style-3 howitwork">
        <Reveal
          className="onStep"
          keyframes={fadeInUp}
          delay={0}
          duration={600}
          triggerOnce
        >
          <i className="bg-color-2 i-boxed icon_wallet"></i>
        </Reveal>
        <div className="text">
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={100}
            duration={600}
            triggerOnce
          >
            <h4 className="box-heading">Set up your wallet</h4>
          </Reveal>
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={200}
            duration={600}
            triggerOnce
          >
            <p className="p-box">
              Once you’ve set up your wallet of choice, connect it to NFT
              marketplace.
            </p>
          </Reveal>
        </div>
        <i className="wm icon_wallet"></i>
      </div>
    </div>

    <div
      // onClick={() => (window.location.href = "/wallet")}
      className="col-xl-3 col-lg-6 col-md-6 mb-3"
    >
      <div className="feature-box f-boxed style-3 howitwork">
        <Reveal
          className="onStep"
          keyframes={fadeInUp}
          delay={0}
          duration={600}
          triggerOnce
        >
          <i className="bg-color-2 i-boxed collection_icon position-relative">
            <img src={CollectionImage} className="collection_img position-absolute" style={{top:'10px', left:'3px'}}></img>
          </i>
        </Reveal>
        <div className="text">
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={100}
            duration={600}
            triggerOnce
          >
            <h4 className="box-heading">Create Your Collection</h4>
          </Reveal>
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={200}
            duration={600}
            triggerOnce
          >
            <p className="p-box">
              Click Create and set up your collection. Add social links, a
              description, profile & banner images, and set a secondary sales
              fee.
            </p>
          </Reveal>
        </div>
        <i className="wm collection_icon mb-2">
          <img src={CollectionBottomImg}></img>
        </i>
      </div>
    </div>
    <div
      // onClick={() => (window.location.href = "/createOptions")}
      className="col-xl-3 col-lg-6 col-md-6 mb-3"
    >
      <div className="feature-box f-boxed style-3 howitwork">
        <Reveal
          className="onStep"
          keyframes={fadeInUp}
          delay={0}
          duration={600}
          triggerOnce
        >
          <i className=" bg-color-2 i-boxed icon_cloud-upload_alt"></i>
        </Reveal>
        <div className="text">
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={100}
            duration={600}
            triggerOnce
          >
            <h4 className="box-heading">Create your NFTs</h4>
          </Reveal>
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={200}
            duration={600}
            triggerOnce
          >
            <p className="p-box">
              Upload your work, add a title and description, and customize your
              NFTs with properties, stats, and unlockable content.
            </p>
          </Reveal>
        </div>
        <i className="wm icon_cloud-upload_alt"></i>
      </div>
    </div>

    <div
      // onClick={() => (window.location.href = "/Author")}
      className="col-xl-3 col-lg-6 col-md-6 mb-3"
    >
      <div className="feature-box f-boxed style-3 howitwork">
        <Reveal
          className="onStep"
          keyframes={fadeInUp}
          delay={0}
          duration={600}
          triggerOnce
        >
          <i className=" bg-color-2 i-boxed icon_tags_alt"></i>
        </Reveal>
        <div className="text">
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={100}
            duration={600}
            triggerOnce
          >
            <h4 className="box-heading">List them to sale</h4>
          </Reveal>
          <Reveal
            className="onStep"
            keyframes={fadeInUp}
            delay={200}
            duration={600}
            triggerOnce
          >
            <p className="p-box">
              Choose between auctions, fixed-price listings, and declining-price
              listings. You choose how you want to sell your NFTs, and we help
              you sell them!
            </p>
          </Reveal>
        </div>
        <i className="wm icon_tags_alt"></i>
      </div>
    </div>
  </div>
);
export default FeatureBox;

import React from 'react';
import PolygonLogo from '../../../assets/react.svg';
import '../../component-css/item-details.css';

const ConnectWallet = (props) => {
  return (
    <div className="popup-box">
      <div className="box main-box">
        <div className="box-body">
          <img src={PolygonLogo} className="polygon-logo" />
          <span> {props.content}</span>
        </div>
        <div className="box-footer">
          <button type="button" className="connectWalletBtn" onClick={props.handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;

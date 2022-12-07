import React from 'react';
import './site.css';

const Siteloader = (props) => {
  return (
    <div className="popup-box">
      <div className="box siteloaderBox">
        <div className="row">
          <div className="col-md-12">{props.content}</div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="dots-bars-loader"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Siteloader;

import React from 'react';
import './site.css';

const Siteloader = (props) => {
  return (
    <div className="popup-box">

      <div className="c-siteloader siteloaderBox">
        <div className='loader'>
        </div>
        <div className="mt-5 c-loader-text loading">{props.content}</div>
      </div>

    </div>
  );
};
export default Siteloader;

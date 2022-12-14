import React from "react";
 
const PopupModal = props => {
  return (
    <div className="popup-box collection-popup-box c-popup-box">
        <span className="close-icon" onClick={props.handleClose}>x</span>
         <div className="box add-collection-box">
        {props.content}
      </div>
    </div>

    
  );
};
 
export default PopupModal;
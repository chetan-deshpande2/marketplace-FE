import React from "react";
 
const PopupModal = props => {
  return (
    <div className="popup-box">
        <span className="close-icon" onClick={props.handleClose}>x</span>
         <div className="box">
        {props.content}
      </div>
    </div>

    
  );
};
 
export default PopupModal;
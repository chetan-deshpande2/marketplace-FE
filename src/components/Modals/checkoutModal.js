import React from "react";
import PolygonLogo from "../../../assets/images/polygonLogo.png";

const CheckoutModal = (props) => {
  return (
    <div className="popup-box">
      <div className="box checkout-box">
        <h4 className="checkout-header">Checkout</h4>
        <div className="checkout-body">
          <p>
            You are about to purchase a <strong> {props.title} </strong>from{" "}
            <strong>{props.author}</strong>
          </p>
          <div className="checkout-mid-box">
            <img src={PolygonLogo} />
            <div className="d-flex flex-column p-1">
              <span className="span1">0x2d376f987...9843</span>
              <span className="span2">Polygon</span>
            </div>
            <span class="badge connected-badge">Connected</span>
          </div>
          {props.typeofCol !== "1" && props.orderType === "On Auction" ? (
            <>
              <input
                className="form-control form-control-sm mt-3 mb-2 checkout-inputbox"
                type="text"
                placeholder="Please Enter the Quantity"
              ></input>
              <input
                className="form-control form-control-sm mt-1 checkout-inputbox"
                type="text"
                placeholder="Please Enter the Bid Price"
              ></input>
            </>
          ) : props.typeofCol !== "1" && props.orderType === "Fixed price" ? (
            <>
              <input
                className="form-control form-control-sm mt-3 checkout-inputbox"
                type="text"
                placeholder="Please Enter the Quantity"
              ></input>
            </>
          ) : props.typeOfCol === "1" && props.orderType === "On Auction" ? (
            <>
              <input
                className="form-control form-control-sm mt-3 checkout-inputbox"
                type="text"
                placeholder="Please Enter the Bid Price"
              ></input>
            </>
          ) : (
            ""
          )}

          <div className="checkout-details">
            {props.content
              ? props.content.map(({ key, value }) => {
                  return (
                    <div className="content">
                      <span className="key">{key}</span>
                      <span>
                        {value} {props.token}
                      </span>
                    </div>
                  );
                })
              : ""}
          </div>
        </div>
        <div className="box-footer">
          <button type="button" className="genericBtn">
            {props.btn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

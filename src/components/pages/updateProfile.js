import React, { useState } from "react";
import Footer from "../components/footer";
import { createGlobalStyle } from "styled-components";
import { updateProfile } from "../../apiServices";
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import Loader from "../components/loader";
import { useNavigate } from "@reach/router";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const UpdateProfile = (props) => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [uname, setUname] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate;

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      console.log(img);
      setProfilePic(img);
    }
  };

  const isValidEmail = async (email) => {
    var atposition = email.indexOf("@");
    var dotposition = email.lastIndexOf(".");
    if (
      atposition < 1 ||
      dotposition < atposition + 2 ||
      dotposition + 2 >= email.length
    ) {
      alert("Please enter a valid e-mail address");
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async () => {
    console.log(props.account.account);
    let data = {
      uname: uname,
      fname: fname,
      lname: lname,
      bio: bio,
      website: website,
      phone: phone,
      userProfile: profilePic,
      email: email,
    };
    console.log(data);
    let res = await isValidEmail(email);
    if (!res) {
      return;
    }
    if (props.account && props.account.account) {
      setLoading(true);
      try {
        let res = await updateProfile(props.account.account, data);
        console.log(res);
        if (res === "User Details updated") {
          NotificationManager.success(res);
          navigate("/personalProfile");
        } else {
          NotificationManager.error(res);
        }
      } catch (e) {
        console.log("error", e);
        NotificationManager.error("Something Went Wrong");
      }

      setLoading(false);
    }
  };

  return (
    <div>
      {" "}
      <GlobalStyles />
      <section
        className="jumbotron breadcumb no-bg"
        style={{ backgroundImage: `url(${"./img/background/subheader.jpg"})` }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h1>Update Profile</h1>
                {/* <p>Anim pariatur cliche reprehenderit</p> */}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="spacer-10"></div>

            <div
              name="contactForm"
              id="contact_form"
              className="form-border"
              action="#"
            >
              <div className="row">
                <div className="col-md-6">
                  <div className="field-set">
                    <label>First Name:</label>
                    <input
                      type="text"
                      name="fname"
                      id="fname"
                      onChange={(r) => {
                        setFname(r.target.value);
                      }}
                      className="form-control"
                      value={fname}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Last Name:</label>
                    <input
                      type="text"
                      name="lname"
                      id="lname"
                      onChange={(r) => {
                        setLname(r.target.value);
                      }}
                      className="form-control"
                      value={lname}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Email Address:</label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      onChange={(r) => {
                        setEmail(r.target.value);
                      }}
                      className="form-control"
                      value={email}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Username:</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      onChange={(r) => {
                        setUname(r.target.value);
                      }}
                      className="form-control"
                      value={uname}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Phone:</label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      onChange={(r) => {
                        setPhone(r.target.value);
                      }}
                      className="form-control"
                      value={phone}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Bio:</label>
                    <input
                      type="text"
                      name="bio"
                      id="bio"
                      onChange={(r) => {
                        setBio(r.target.value);
                      }}
                      value={bio}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Website:</label>
                    <input
                      type="text"
                      name="website"
                      id="website"
                      onChange={(r) => {
                        setWebsite(r.target.value);
                      }}
                      className="form-control"
                      value={website}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="field-set">
                    <label>Upload Profile Pic:</label>
                    {profilePic ? (
                      <img
                        className="upload-profile"
                        src={URL.createObjectURL(profilePic)}
                        alt="profile-pic"
                      />
                    ) : (
                      ""
                    )}
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.gif"
                      name="myImage"
                      onChange={(e) => onImageChange(e)}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div id="submit" className="pull-left">
                    <button
                      type="submit"
                      id="send_message"
                      className="btn btn-main color-2"
                      onClick={() => {
                        handleUpdateProfile();
                      }}
                    >
                      Update Profile
                    </button>
                  </div>

                  <div className="clearfix"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.account,
  };
};

export default connect(mapStateToProps)(UpdateProfile);

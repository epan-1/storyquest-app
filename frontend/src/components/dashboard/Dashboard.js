// This is the page is protected and can only be viewed when the user logins

import React, { Component } from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";

class Dashboard extends Component {

    onLogoutClick = (e) => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {
        // The user here refers to the decoded JWT token. It is a JSON Object with fields specified in the login route in users.js in the backend
        const { user } = this.props.auth;
        return(
            <div style={{ height: "76vh"}} className="container valign-wrapper">
                <div className="row">
                    <div className="col s12 center-align">
                        <h4>
                            <b>Hey there,</b> {user.name}
                            <p className="flow-text grey-text text-darken-1">
                                You are logged into a full-stack{" "}<span style={{ fontFamily: "monospace"}}>MERN</span> app 👏
                            </p>
                        </h4>
                        <button style={{width: "150px", borderRadius: "3px", letterSpacing: "1.5px", marginTop: "1rem"}} onClick={this.onLogoutClick} className="btn btn-large waves-effect waves-light hoverable blue accent-3">Logout</button>
                    </div>
                </div>
            </div>
        );
    }
}

Dashboard.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser}
)(Dashboard);
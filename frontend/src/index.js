// This is the entry point into the react app. It combines all of the different components together to form a beautiful user interface.
import React from 'react';
import ReactDOM from 'react-dom';
import {Route, Switch, BrowserRouter as Router} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

import { Provider } from "react-redux";
import store from "./store";

// Import CSS files
import 'bootstrap/dist/css/bootstrap.min.css'
import './css/boldTheme.css'

// Import our React components
import App from './App';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from "./components/private-route/PrivateRoute";
import AddArtifact from "./components/layout/AddArtifact";
import ViewArtifact from "./components/layout/ViewArtifact";
import Profile from "./components/dashboard/Profile";
import MyProfile from "./components/dashboard/myProfile";
import DeleteArtifact from "./components/layout/DeleteArtifact";
import EditArtifact from "./components/layout/EditArtifact";
import FourOFour from "./components/layout/FourOFour";
import ArtifactsList from './components/layout/ArtifactsList';
import MyArtifacts from './components/layout/MyArtifacts';
import EditImages from './components/layout/EditImages';
import AddImage from "./components/media/AddImage";

import ProfileUpload from "./components/dashboard/ProfileUpload";

// Check for token to keep the user logged in

if (localStorage.jwtToken) {
    // Set auth header
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and expiry
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));

    // Check for an expired token
    const currentTime = Date.now() / 1000; // Math to get it into milliseconds
    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());

        // Redirect to login
        window.location.href = "./login";
    }
}

// Add the routes to the different pages from that you can access from the Navbar
const routing = (
    <Provider store={store}>
        <Router>
            <div>
                <Switch>
                    <Route exact path="/" component={App} />  
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Register} />
                    <Route exact path="/add_artifact" component ={AddArtifact} />
                    <Route exact path="/view_artifact/:id" component ={ViewArtifact} />
                    <Route exact path="/profile/:id" component={Profile} />
                    <Route exact path="/myprofile" component= {MyProfile} />
                    <Route exact path="/delete_artifact/:id" component ={DeleteArtifact} />
                    <Route exact path="/edit_artifact/:id" component ={EditArtifact} />
                    <Route exact path="/list/:searchString" component={ArtifactsList} />
                    <Route exact path="/myartifacts" component={MyArtifacts} />
                    <Route exact path="/edit_images/:id" component ={EditImages} />
                    <Route exact path="/add_image/:id" component ={AddImage} />
                    <PrivateRoute exact path="/profile_image" component={ProfileUpload} />
                    {/* Generic component so that all undefined routes redirect to 404 page. If no other route is matched, then this one will be */}
                    <Route component ={FourOFour} />
                </Switch>
            </div>
        </Router>
    </Provider>
)
   
ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

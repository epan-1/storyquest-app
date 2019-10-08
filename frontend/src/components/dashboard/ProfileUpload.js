import React, {Component} from 'react';
import ProfileImgUpload from '../media/ProfileImgUpload';

const PROFILE_UPLOAD = 'http://localhost:5000/api/users/upload_profile_image';

class ProfileUpload extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ProfileImgUpload uploadPath={PROFILE_UPLOAD} />
        );
    }
}

export default ProfileUpload;

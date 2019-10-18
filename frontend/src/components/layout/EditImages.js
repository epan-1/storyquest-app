import React, {Component} from 'react';
import Helmet from 'react-helmet';
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import axios from 'axios';


import {
    Container,
    Col,
    Row,
    Button,
    Form, 
    FormGroup, 
    Label, 
    Input,
} from 'reactstrap';

const BANNER = "/images/cover.png";
const MARGIN = 1;
const HALF = 6;

class DeleteImage extends Component {

    constructor(props) {
        super(props);
        this.onDelete = this.onDelete.bind(this);
    }

    onDelete () {
        return this.props.image.id;
    }
    
    render () {
        return (
            <tr>
        
                <td> <img style={{width: "50%"}} alt="" src={this.props.image.src} /></td>
                <td>
                    <Button onClick={this.onDelete}>DELETE</Button>
                </td>
            
            </tr>
        )
    }
}

class EditImages extends Component{

    constructor(props){
        super(props);

        this.state = {
            images: [],
            ids:  [],
        }

        this.imageList = this.imageList.bind(this);


    }


    imageList() {
        return this.state.images.map(function(currImage, i){
            return <DeleteImage image={currImage} key={i} />;
        })
    }



    componentDidMount() {
        axios.get('/artifact/' + this.props.match.params.id)
        .then(res => {
            res.data.images.forEach(imageID => {
                axios.get('/artifact_images/' + this.props.match.params.id + '/' + imageID)
                    .then(res => {
                        this.setState(prevState => ({
                                images: [
                                    ...prevState.images, 
                                    {
                                        src: `data:image/jpeg;base64,${res.data}`, 
                                        altText: "",
                                        caption: "",
                                        header: "", 
                                        id: imageID
                                    }
                                ],
                                ids: [
                                    ...prevState.ids,
                                    imageID
                                ]
                            }));
                    })
                    .catch(err => {
                        console.log(err);
                    });
            });
        })
        .catch(err => {
            console.log(err);
        });

}


    render(){

        return(
            <div>
                 {/*Hemet*/}
              <Helmet> 
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                    <title>Add/Delete Images</title>
                </Helmet>


                <Container className="justify-content-center" fluid>
                    <Row>
                        <img src={BANNER} alt="StoryQuest Banner" className="banner-image"/>
                    </Row>
                </Container>

                <Container className="register-box bg-light rounded-lg">

                 {/*Form title*/}
                 <Row>
                     <Col xs = "6">
                        <Link to="/" style={{paddingLeft: "40px", paddingTop: "10px", paddingBottom: "20px"}}>
                        <i className="far fa-arrow-alt-circle-left" style={{fontSize: "20px"}}> Back to Home</i>
                        </Link>
                    </Col>

                    
                </Row>
                <br></br>

                <Row>
                        <Col sm = {MARGIN}></Col>
                        <Col>
                        <h2 className="text-left" >Delete and Add Images of your Artifact</h2>
                        </Col>
                        <Col sm = {MARGIN}></Col>
                </Row>

                <Row>

                <table className="table table-striped justify-content-center" size="sm" >
                        <thead>
                        <tr>
                            <th className="tHeader">Image</th>
                            <th className="tHeader">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        { this.imageList() }
                        </tbody>
                    </table>


                </Row>




            </Container>


            </div>
        )

        
    }

}




EditImages.propTypes = {
    imageData: PropTypes.object.isRequired
}

export default EditImages;
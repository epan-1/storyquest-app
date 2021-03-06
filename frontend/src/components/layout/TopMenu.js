// This component renders a basic navbar with a few links on it for new users to get started using our web app. 
// So the navbar is made visible only if someone hasn't logged into the inn before we came here.

import React, {Component} from 'react';
import {
    Button,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    Container,
    Row,
    Col,
    DropdownMenu,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownItem,
} from 'reactstrap';

const LOGO = '/images/cover.png'

class TopMenu extends Component {

    render() {
        return(
            <header>
                <Navbar fixed="top" color="secondary" light expand="xs" className="border-bottom border-gray" style={{height: 80}}>
                    {/* Use grid system to create 1 row and 3 columns to put each of the Navbar elements into */}
                    <NavbarToggler onClick={this.toggle}/>
                    <Container>
                        <Row noGutters className="position-relative w-100 align-items-center">
                            <Col className="d-none d-lg-flex justify-content-start">
                                <Nav className="mlx-auto" navbar>
                                    <NavItem className="d-flex align-items-center">
                                        <NavLink className="font-weight-bold " href="#about">About</NavLink>
                                    </NavItem>
                                    <NavItem className="d-flex align-items-center">
                                        <NavLink className="font-weight-bold " href="/register">Getting Started</NavLink>
                                    </NavItem>
                                </Nav>
                            </Col>
                            
                            <Col className="d-flex justify-content-xs-center justify-content-lg-center">
                                <NavbarBrand className="d-inline-block p-1" href="/" style={{ width: 180 }}>
                                    <img src={LOGO} alt="logo" className="position-relative img-fluid rounded-sm" />
                                </NavbarBrand>
                            </Col>

                            <Col className="d-none d-lg-flex justify-content-end">
                                <Nav className="mrx-auto" navbar>
                                    <UncontrolledDropdown className="d-flex align-items-center" nav inNavbar>
                                        <DropdownToggle className="font-weight-bold" nav caret><i className="fa fa-user-circle" style={{fontSize: "36px"}} /></DropdownToggle>
                                        <DropdownMenu right>
                                        <DropdownItem href="/login"><Button>Login</Button></DropdownItem>
                                        <DropdownItem href="/register"><Button>Register</Button></DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                            </Col>
                        </Row>
                    </Container>
                </Navbar>
            </header>
        )
    };
} 

export default TopMenu;
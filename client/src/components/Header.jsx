import React from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../assets/images/logo.svg';

export default function Header() {
  return (
    <Navbar className="main-header" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt="Logo"
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top drop-shadow me-2"
          />
          Conference Scheduler
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/upload">Upload</Nav.Link>
            <Nav.Link as={NavLink} to="/scheduled">Scheduled Sessions</Nav.Link>
            <Nav.Link as={NavLink} to="/hotels">Hotels</Nav.Link>
            <Nav.Link href="/ConfexSchedulingTemp.xlsx" download="template">Template</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

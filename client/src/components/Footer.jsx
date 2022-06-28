import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export default function Footer() {
  return (
    <Container fluid className="footer">
      <Row className="justify-content-md-center">
        &copy;
        {' '}
        {new Date().getFullYear()}
        {' '}
        The Conference Exchange. All Rights Reserved.
      </Row>
    </Container>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import NavButton from '../components/NavButton';

export default function Home() {
  const navigate = useNavigate();

  const handleNavNext = () => {
    navigate('/upload');
  };

  return (
    <>
      <Container className="main-components">
        <Card className="text-center mx-auto" border="primary" style={{ width: '35rem' }}>
          <Card.Header>
            <h3>Welcome to The Conference Exchange&apos;s Conference Scheduler!</h3>
          </Card.Header>
          <Card.Body>
            <NavButton onClick={handleNavNext}>
              Next
            </NavButton>
          </Card.Body>
          <Card.Footer align="left">
            <b>User Directions:</b>
            <br />
            <ul>
              <li>The Excel file uploaded into this system must be the provided template.</li>
              <li>The template can be downloaded at the above link under: &quot;Template&quot;</li>
              <li>Users will receive a list of unscheduled sessions from the file.</li>
              <li>Make sure all of the information provided is accurate and up-to-date.</li>
              <li>After uploading the file, you will walk through a series of steps.</li>
              <li>At any point, you may exit and restart the process from the beginning.</li>
            </ul>
          </Card.Footer>
        </Card>
      </Container>
    </>
  );
}

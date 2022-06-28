import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import UploadForm from '../components/UploadForm';
//import HotelUploadForm from '../components/HotelUploadForm';
//import SpeakerUploadForm from '../components/SpeakerUploadForm';
import ConfirmModal from '../components/ConfirmModal';
import NavButton from '../components/NavButton';
import PurgeDbButton from '../components/PurgeDbButton';
import DateRangePicker from '../components/DateRangePicker';
import endpoints from '../config/api-config';
import api from '../utils/api';
import { useSchedulerContext } from '../data/scheduler-context';

export default function Upload() {
  // eslint-disable-next-line no-unused-vars
  const context = useSchedulerContext();
  const navigate = useNavigate();
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleNavNext = () => {
    navigate('/sessions');
  };

  return (
    <Container className="upload-components">
      <ConfirmModal
        show={showTransferModal}
        positiveActionName="Confirm"
        onPositiveAction={() => { api.switchDbs(); setShowTransferModal(false); }}
        onNegativeAction={() => setShowTransferModal(false)}
      >
        Transfer all scheduled sessions back to unscheduled and reset the data?
      </ConfirmModal>
      <Row>
        <Col>
          <Card className="text-center mx-auto" border="primary" style={{ width: '17rem' }}>
            <Card.Header><b>Upload Initial Data to Schedule Conference</b></Card.Header>
            <Card.Body>
              <UploadForm
                disabled={uploadDisabled}
                onUpload={() => setUploadDisabled(true)}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center mx-auto" border="primary" style={{ width: '17rem' }}>
            <Card.Header><b>Select Conference Dates</b></Card.Header>
            <Card.Body>
              <Card.Text>
                Please select the start and end dates for the conference.
              </Card.Text>
              <DateRangePicker />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center mx-auto" border="primary" style={{ width: '17rem' }}>
            <Card.Header><b>Start Scheduling a New Conference</b></Card.Header>
            <Card.Body>
              <Card.Text>
                Clear all stored data including sessions, hotels, and dates.
              </Card.Text>
              <PurgeDbButton
                dbType={`${endpoints.database.unschedule} Sessions`}
                onPurge={() => setUploadDisabled(false)}
              />
              <PurgeDbButton
                dbType={`${endpoints.database.schedule} Sessions`}
                onPurge={() => setUploadDisabled(false)}
              />
              <PurgeDbButton
                dbType={`${endpoints.database.hotel} Information`}
                onPurge={() => setUploadDisabled(false)}
              />
              <PurgeDbButton
                dbType={`${endpoints.database.speaker} Information`}
                onPurge={() => setUploadDisabled(false)}
              />
              <PurgeDbButton
                dbType={`${endpoints.database.date} Selection`}
                onPurge={() => setUploadDisabled(false)}
              />
              <PurgeDbButton
                dbType={endpoints.database.all}
                onPurge={() => setUploadDisabled(false)}
              />
            </Card.Body>
          </Card>
          <br />
          <Card className="text-center mx-auto" border="primary" style={{ width: '17rem' }}>
            <Card.Header><b>Reset Data</b></Card.Header>
            <Card.Body>
              <Card.Text>
                Selecting this button will transfer data from the scheduled database into
                unscheduled database.
              </Card.Text>
              <Button onClick={() => setShowTransferModal(true)} size="sm">
                Transfer Data
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-3 justify-content-end">
        <NavButton onClick={handleNavNext}>
          Next
        </NavButton>
      </Row>
    </Container>
  );
}

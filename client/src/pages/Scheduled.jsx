import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import DownloadButton from '../components/DownloadButton';
import { truncate } from '../utils/helpers';
import api from '../utils/api';
import constants from '../config/constants';
import Paginate from '../components/Paginate';

export default function Scheduled() {
  const [sessions, setSessions] = useState(null);
  const [unscheduled, setUnscheduled] = useState(null);
  const navigate = useNavigate();
  // Pagination variables
  const [visibleSessions, setVisibleSessions] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [sessionOffset, setSessionOffset] = useState(0);
  const continueSchedule = event => {
    event.preventDefault();
    event.stopPropagation();
    navigate('/sessions');
  };

  // Fetch scheduled sessions on first render
  // and whenever the filter selections change
  useEffect(() => {
    if (sessions != null) {
      return;
    }
    api.outputSchedule()
      .then(data => {
        setSessions(data);
        setPageCount(Math.ceil(data.length / constants.RESULTS_PER_PAGE));
      }).catch(() => {
        throw new Error('Could not fetch sessions');
      });
    api.filterSessions({})
      .then(data => {
        setUnscheduled(data);
      }).catch(() => {
        // TODO: handle errors gracefully
        throw new Error('Could not fetch unscheduled sessions');
      });
  }, [sessions, unscheduled]);

  // Sets which sessions are currently visible
  useEffect(() => {
    // context.reset();
    if (sessions == null) {
      return;
    }
    const endOffset = sessionOffset + constants.RESULTS_PER_PAGE;
    setVisibleSessions(sessions.slice(sessionOffset, endOffset));
  }, [sessionOffset, sessions]);

  const handlePageChange = event => {
    setSessionOffset((event.selected * constants.RESULTS_PER_PAGE) % sessions.length);
  };

  // Returns a string representing the index range of results
  const getPageRangeString = () => {
    if (!visibleSessions || (visibleSessions.length === 0)) {
      return '0';
    }
    const endOffset = sessionOffset + visibleSessions.length;
    return `${sessionOffset + 1}-${endOffset}`;
  };

  return (
    <Container className="main-components">

      <Row className="section-header">
        <h1>Current Conference Schedule</h1>
      </Row>

      <Row>
        {/* Filters
        <Col className="col -3 left-menu">
          <h3>Filters go here</h3>
        </Col> */}

        {/* Session selection */}
        <Col className="flex">
          <Row>
            <Col>
              <p className="mb-0">
                {sessions ? `Total Sessions Scheduled: ${sessions.length}` : 'No results'}
              </p>
            </Col>
            <Col>
              <p className="mb-0">
                {unscheduled ? `Total Sessions Unscheduled: ${unscheduled.length}` : 'No results'}
              </p>
            </Col>
            <Col>
              <Button variant="secondary" onClick={continueSchedule} size="sm">
                Continue Scheduling
              </Button>
            </Col>
            <Col>
              <DownloadButton />
            </Col>
            <Col className="text-end">
              <p>{`Showing ${getPageRangeString()}`}</p>
            </Col>
          </Row>

          <Row>
            <Table bordered hover style={{ width: '100%' }}>
              <thead>
                <tr>

                  <th scope="col">Title</th>
                  <th scope="col">Topic</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Hotel</th>
                  <th scope="col">Room</th>
                  <th scope="col">Date</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {visibleSessions && visibleSessions.map(session => (
                  <tr key={session.SessionID}>
                    <td>{truncate(session.Title, constants.MAX_STRING_LENGTH)}</td>
                    <td>{truncate(session.Topic, constants.MAX_STRING_LENGTH)}</td>
                    <td>{truncate(session.Subject, constants.MAX_STRING_LENGTH)}</td>
                    <td>{session.Property}</td>
                    <td>{session.Room}</td>
                    <td>{session.Date}</td>
                    <td>{session.Time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Row>
          <Row className="mt-3 justify-content-end">
            <Paginate pageCount={pageCount} onPageChange={handlePageChange} />
          </Row>
          <Row className="flex-grow-1" />
        </Col>
      </Row>
    </Container>
  );
}

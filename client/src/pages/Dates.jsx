import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';

import dateData from '../data/datesData';
import NavButton from '../components/NavButton';
import { useSchedulerContext } from '../data/scheduler-context';
import Paginate from '../components/Paginate';
import api from '../utils/api';
import constants from '../config/constants';

const SELECTED_SESSION = 'selectedSession';
const SELECTED_WEEKDAY = 'selectedWeekday';
const SELECTED_TIME = 'selectedTime';

const defaultFilters = {
  days: [],
};

export default function Dates() {
  const [nextButtonEnabled, setNextButtonEnabled] = useState(true);
  const context = useSchedulerContext();
  const navigate = useNavigate();

  // Pagination variables
  const [visibleSessions, setVisibleSessions] = useState(null);
  const [sessionOffset, setSessionOffset] = useState(0);
  const pageCount = useMemo(() => (
    Math.ceil(context.sessions.length / constants.RESULTS_PER_PAGE)), [context.sessions]);

  const [filterOptions, setFilterOptions] = useState(defaultFilters);

  // Fetch filters on the first render
  useEffect(() => {
    api.getConferenceTimes()
      .then(res => {
        const filters = { days: res };
        setFilterOptions(filters);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  // Restores state of selections from context
  useEffect(() => {
    if (!visibleSessions) {
      return;
    }
    if (context.sessions.length > 0) {
      document.getElementsByName(SELECTED_SESSION).forEach(checkbox => {
        checkbox.checked = true;
      });
    }
    if (context.dates.weekdays.length > 0) {
      document.getElementsByName(SELECTED_WEEKDAY).forEach(checkbox => {
        checkbox.checked = context.dates.weekdays.includes(checkbox.value);
      });
    }
    if (context.dates.times.length > 0) {
      document.getElementsByName(SELECTED_TIME).forEach(checkbox => {
        checkbox.checked = context.dates.times.includes(checkbox.value);
      });
    }
    const oneOrMoreDays = context.dates.weekdays.length > 0;
    const oneOrMoreTimes = context.dates.times.length > 0;
    setNextButtonEnabled(oneOrMoreDays && oneOrMoreTimes);
  }, [context.dates, context.sessions, filterOptions, visibleSessions]);

  // Set which sessions are currently visible
  useEffect(() => {
    const endOffset = sessionOffset + constants.RESULTS_PER_PAGE;
    setVisibleSessions(context.sessions.slice(sessionOffset, endOffset));
  }, [sessionOffset, context.sessions]);

  const handlePageChange = event => {
    setSessionOffset((event.selected * constants.RESULTS_PER_PAGE) % context.sessions.length);
  };

  const handleDaySelected = event => {
    const checkbox = event.target;

    if (checkbox.checked) {
      context.dates.weekdays.push(checkbox.value);
    } else {
      const indexToRemove = context.dates.weekdays.findIndex(e => e === checkbox.value);
      context.dates.weekdays.splice(indexToRemove, 1);
    }
    // Triggers effect to fetch sessions using new filters
    context.setDates({ ...context.dates });
  };

  const handleTimeSelected = event => {
    const checkbox = event.target;
    if (checkbox.checked) {
      context.dates.times.push(checkbox.value);
    } else {
      const indexToRemove = context.dates.times.findIndex(e => e === checkbox.value);
      context.dates.times.splice(indexToRemove, 1);
    }
    // Triggers effect to fetch sessions using new filters
    context.setDates({ ...context.dates });
  };

  // Toggles all the checkboxes and the next button
  const handleSelectAll = event => {
    const selectAllCheckbox = event.target;
    const dateCheckboxes = document.getElementsByName(SELECTED_WEEKDAY);
    const timeCheckboxes = document.getElementsByName(SELECTED_TIME);

    if (selectAllCheckbox.checked) {
      dateCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        context.dates.weekdays.push(checkbox.value);
      });
      timeCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        context.dates.times.push(checkbox.value);
      });
    } else { // Remove the room
      dateCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const indexToRemove = context.dates.weekdays.findIndex(e => e === checkbox.value);
        context.dates.weekdays.splice(indexToRemove, 1);
      });
      timeCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const indexToRemove = context.dates.times.findIndex(e => e === checkbox.value);
        context.dates.times.splice(indexToRemove, 1);
      });
    }
    // Triggers effect to fetch sessions using new filters
    context.setDates({ ...context.dates });
  };

  const handleSubmitClicked = event => {
    event.preventDefault();
    event.stopPropagation();
    navigate('/rooms');
  };

  const handleNavBackClicked = () => {
    navigate(-1); // Equivalent to clicking browser back button
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
        <h1>Step 2: Select Date & Times</h1>
      </Row>

      <Row>
        {/* Dates */}
        <Col className="col-3 pb-3 left-menu">
          <Form>
            <p className="text-center menu-title">Dates</p>
            <Form.Check id={constants.SELECT_ALL} label="Select All Dates & Times" onClick={handleSelectAll} />
            <fieldset>
              <Form.Group>
                <Form.Label as="legend" column>
                  Dates:
                </Form.Label>
                {filterOptions
                  && filterOptions.days.map(date => (
                    <Form.Check
                      name={SELECTED_WEEKDAY}
                      onClick={handleDaySelected}
                      label={date}
                      value={date}
                      key={date}
                    />
                  ))}
              </Form.Group>
            </fieldset>
            <fieldset>
              <Form.Group>
                <Form.Label as="legend" column>
                  Times:
                </Form.Label>
                {dateData.TimeTypes.map(times => (
                  <Form.Check
                    name={SELECTED_TIME}
                    onClick={handleTimeSelected}
                    label={times.name}
                    value={times.name}
                    key={times.name}
                  />
                ))}
              </Form.Group>
            </fieldset>
          </Form>
        </Col>

        {/* Sessions */}
        <Col className="col-9 ps-3 pe-2">
          <Row>
            <Col>
              <p className="mb-0">
                {`Need to be scheduled: ${context.sessions.length}`}
              </p>
            </Col>
            <Col className="text-end">
              <p>{`Showing ${getPageRangeString()}`}</p>
            </Col>
          </Row>
          <Form onSubmit={handleSubmitClicked} style={{ height: '100%' }}>
            <Col
              className="d-flex flex-column justify-content-between"
              style={{ height: '100%' }}
            >
              <Row>
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th scope="row" className="visually-hidden"> </th>
                      <th scope="col">Title</th>
                      <th scope="col">Format</th>
                      <th scope="col">Est. Seating</th>
                      <th scope="col">AV Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSessions && visibleSessions.map(session => (
                      <tr key={session.SessionID}>
                        <td>
                          <Form.Check
                            name={SELECTED_SESSION}
                            value={session.SessionID}
                            disabled
                          />
                        </td>
                        <td>{session.Title}</td>
                        <td>{session.Format}</td>
                        <td>{session.EstSeating}</td>
                        <td>{session.AV_Equipment}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Row>
              <Row className="mt-3 justify-content-end">
                <Paginate pageCount={pageCount} onPageChange={handlePageChange} />
                <NavButton
                  variant="secondary"
                  onClick={handleNavBackClicked}
                >
                  Back
                </NavButton>
                <NavButton
                  type="submit"
                  className="ms-2"
                  disabled={!nextButtonEnabled}
                >
                  Next
                </NavButton>
              </Row>

              {/* Spacer */}
              <Row className="flex-grow-1" />

            </Col>
          </Form>
        </Col>
      </Row>

    </Container>
  );
}

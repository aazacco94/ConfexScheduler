import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import ActionButton from '../components/ActionButton';
import Paginate from '../components/Paginate';
import NavButton from '../components/NavButton';
import { useSchedulerContext } from '../data/scheduler-context';
import ConfirmModal from '../components/ConfirmModal';
import FinishScheduleCycleModal from '../components/FinishScheduleCycleModal';
import constants from '../config/constants';
import api from '../utils/api';
import {
  getCheckboxValues,
  findRoomById,
  findRoomIndexById,
} from '../utils/helpers';

const SELECTED_ROOM = 'selectedRoom';
const SELECTED_PROPERTY = 'selectedProperty';
const SELECTED_ROOM_SETUP = 'selectedRoomSetup';
const SELECTED_AV_SETUP = 'selectedAvSetup';
const SELECTED_MIN_CAPACITY = 'selectedMinCapacity';
const SELECTED_MAX_CAPACITY = 'selectedMaxCapacity';
/*
 * Gets the selected filters.
 *
 * @param elements a NodeList of elements from the filters form
 * @returns an object containing the filter selections
 */
const getFilters = elements => {
  // These are the names of the form input fields for the filters
  const {
    selectedProperty,
    selectedRoomSetup,
    selectedAvSetup,
    selectedMinCapacity,
    selectedMaxCapacity,
  } = elements;

  return {
    properties: getCheckboxValues(selectedProperty),
    roomSetups: getCheckboxValues(selectedRoomSetup),
    avSetups: getCheckboxValues(selectedAvSetup),
    minCapacity: parseInt(selectedMinCapacity.value, 10) || 0,
    maxCapacity: parseInt(selectedMaxCapacity.value, 10) || 0,
  };
};

// Fetches different filters from different endpoints
const fetchFilters = async () => {
  const filters = {
    properties: [],
    roomSetups: [],
    avSetups: [],
  };

  try {
    filters.avSetups = await api.getAVOptions();
    filters.properties = await api.getHotelOptions();
  } catch (err) {
    console.log(err);
  }

  return filters;
};

export default function Rooms() {
  let thinking = false;
  const [allRooms, setAllRooms] = useState(null);
  const [submitEnabled, setSubmitEnabled] = useState(true);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const context = useSchedulerContext();
  const navigate = useNavigate();

  // Pagination variables
  const [visibleRooms, setVisibleRooms] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [roomOffset, setRoomOffset] = useState(0);

  const [filterOptions, setFilterOptions] = useState(null);

  const [showErrorScheduling, setShowErrorScheduling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFinishMod, setshowFinishMod] = useState(false);
  const [finishedMessage, setFinishedMessage] = useState('');
  //const [disableSessionPage, setDisableSessionPage] = useState(false);

  // Fetch filters on the first render
  useEffect(() => {
    if (filterOptions != null) {
      // Already fetched the filters
      return;
    }
    fetchFilters()
      .then(res => {
        setFilterOptions(res);
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Restores state of selections from context
  useEffect(() => {
    if (!visibleRooms) {
      return;
    }
    if (context.filters.properties.length > 0) {
      document.getElementsByName(SELECTED_PROPERTY).forEach(checkbox => {
        checkbox.checked = context.filters.properties.includes(checkbox.value);
      });
    }
    if (context.filters.roomSetups.length > 0) {
      document.getElementsByName(SELECTED_ROOM_SETUP).forEach(checkbox => {
        checkbox.checked = context.filters.roomSetups.includes(checkbox.value);
      });
    }
    if (context.filters.avSetups.length > 0) {
      document.getElementsByName(SELECTED_AV_SETUP).forEach(checkbox => {
        checkbox.checked = context.filters.avSetups.includes(checkbox.value);
      });
    }
    if (typeof context.filters.minCapacity === 'number') {
      document
        .getElementById(SELECTED_MIN_CAPACITY)
        .setAttribute('value', context.filters.minCapacity);
    }
    if (typeof context.filters.maxCapacity === 'number' && context.filters.maxCapacity > 0) {
      document
        .getElementById(SELECTED_MAX_CAPACITY)
        .setAttribute('value', context.filters.maxCapacity);
    }

    setSubmitEnabled(context.rooms.length > 0);
    let count = 0;
    document.getElementsByName(SELECTED_ROOM).forEach(checkbox => {
      const room = findRoomById(context.rooms, checkbox.value);
      checkbox.checked = (room !== undefined);
      if (checkbox.checked) {
        count += 1;
      }
    });
    const selectAllCheckbox = document.getElementById(constants.SELECT_ALL);
    selectAllCheckbox.checked = (count === visibleRooms.length);
  }, [context.rooms, context.filters, filterOptions, visibleRooms]);

  useEffect(() => {
    if (allRooms == null) {
      return;
    }
    const endOffset = roomOffset + constants.RESULTS_PER_PAGE;
    setVisibleRooms(allRooms.slice(roomOffset, endOffset));
  }, [roomOffset, allRooms]);

  const handlePageChange = event => {
    setRoomOffset((event.selected * constants.RESULTS_PER_PAGE) % allRooms.length);
  };

  // Fetch unscheduled sessions on first render
  // and whenever the filter selections change
  useEffect(() => {
    if (filterOptions == null) {
      // Filters have not been fetched yet
      return;
    }
    api.filterRooms({
      avSetups: context.filters.avSetups,
      properties: context.filters.properties,
      roomSetups: context.filters.roomSetups,
      minCapacity: context.filters.minCapacity,
      maxCapacity: context.filters.maxCapacity,
      times: context.dates.times,
      weekdays: context.dates.weekdays,
      sessions: context.sessions.map(s => s.SessionID),
    }).then(res => {
      setAllRooms(res);
      setPageCount(Math.ceil(res.length / constants.RESULTS_PER_PAGE));
    }).catch(() => {
      // TODO: handle errors gracefully
      throw new Error('Error filtering Rooms');
    });
  }, [context.dates.times, context.dates.weekdays,
    context.filters, context.sessions, filterOptions]);

  const handleApplyFiltersClicked = event => {
    const filters = getFilters(event.target.elements);
    event.preventDefault();
    event.stopPropagation();
    // Triggers effect to fetch sessions using new filters
    context.setFilters(filters);
  };

  const handleSubmitClicked = event => {
    event.preventDefault();
    event.stopPropagation();
    setShowSubmitConfirmation(true);
  };

  //handles the submit schedule confirmation. Sends session id/context to back.
  //then displays the correct modal accordingly.
  const handleConfirmClicked = () => {
    if (thinking) { return; }
    thinking = true;
    // Sends all context information back to schedule sessions.
    api.sendAllForScheduling({
      sessions: context.sessions.map(s => s.SessionID),
      rooms: context.rooms.map(r => r.RoomID),
      dates: context.dates,
    }).then(data => {
      // if the response value: good is successful then prompt user for next step.
      if (data.good) {
        context.reset();
        // This will launch the FinishedScheduleCycleModal.
        setShowSubmitConfirmation(false);
        setFinishedMessage('Would you like to view the current schedule?');
        setshowFinishMod(true);
      } else {
        /* Session scheduled failed will display the message/error from server in modal */
        setErrorMessage(data.message);
        setShowSubmitConfirmation(false);
        setShowErrorScheduling(true);
      }
    }).catch(() => {
      setErrorMessage('Error in post call for scheduling sessions');
      setShowSubmitConfirmation(false);
      setShowErrorScheduling(true);
    });
  };

  // Enables the submit button if one or more items are selected
  const handleItemSelected = event => {
    const checkbox = event.target;

    if (checkbox.checked && !context.rooms.includes(checkbox.value)) {
      const roomToAdd = findRoomById(visibleRooms, checkbox.value);
      context.rooms.push(roomToAdd);
    } else { // Remove the room
      const indexToRemove = findRoomIndexById(context.rooms, checkbox.value);
      context.rooms.splice(indexToRemove, 1);
    }
    // Create a shallow copy of the modified array to trigger a state change
    context.setRooms(Array.from(context.rooms));
  };

  // Toggles all the checkboxes and the submit button
  const handleSelectAll = event => {
    const selectAllCheckbox = event.target;
    const roomCheckboxes = document.getElementsByName(SELECTED_ROOM);

    if (selectAllCheckbox.checked) {
      roomCheckboxes.forEach(checkbox => {
        const roomToAdd = findRoomById(visibleRooms, checkbox.value);
        if (!context.rooms.includes(roomToAdd)) {
          context.rooms.push(roomToAdd);
        }
      });
    } else { // Remove the room
      roomCheckboxes.forEach(checkbox => {
        const indexToRemove = findRoomIndexById(context.rooms, checkbox.value);
        context.rooms.splice(indexToRemove, 1);
      });
    }
    // Create a shallow copy of the modified array to trigger a state change
    context.setRooms(Array.from(context.rooms));
  };

  const handleNavBackClicked = () => {
    navigate(-1); // Equivalent to clicking browser back button
  };

  const restartOnFailClick = () => {
    context.reset();
    navigate(-2); // Equivalent to clicking browser back button twice
  };

  const clearRooms = () => {
    context.setRooms([]);
  };

  const selectAllRooms = () => {
    context.setRooms(allRooms);
  };

  // Returns a string representing the index range of results
  const getPageRangeString = () => {
    if (!visibleRooms || (visibleRooms.length === 0)) {
      return '0';
    }
    const endOffset = roomOffset + visibleRooms.length;
    return `${roomOffset + 1}-${endOffset}`;
  };

  return (
    <Container className="main-components">
      <ConfirmModal
        show={showSubmitConfirmation}
        positiveActionName="Confirm"
        onPositiveAction={handleConfirmClicked}
        onNegativeAction={() => setShowSubmitConfirmation(false)}
      >
        Submit selections?
      </ConfirmModal>

      <FinishScheduleCycleModal
        show={showFinishMod}
        message={finishedMessage}
        disable={false}
      />
      <ConfirmModal
        show={showErrorScheduling}
        positiveActionName="Ok"
        onPositiveAction={restartOnFailClick}
        onNegativeAction={() => setShowErrorScheduling(false)}
      >
        &emsp; &emsp; &emsp; &emsp; &emsp; &emsp;
          &emsp; &emsp; &emsp; &emsp; &emsp;
        <b>ERROR!!</b>
        <div>
          {errorMessage}
        </div>
      </ConfirmModal>

      <Row className="section-header">
        <h1>Step 3: Select Rooms</h1>
      </Row>

      <Row>
        {/* Filters */}
        <Col className="col-3 left-menu">
          <Form onSubmit={handleApplyFiltersClicked}>
            <p className="text-center menu-title">Filters</p>
            <fieldset>
              <Form.Group>
                <Form.Label as="legend" column>
                  Property
                </Form.Label>
                {filterOptions
                  && filterOptions.properties
                  && filterOptions.properties.map(x => (
                    <Form.Check
                      name={SELECTED_PROPERTY}
                      label={x}
                      value={x}
                      key={x}
                    />
                  ))}
              </Form.Group>
            </fieldset>
            <fieldset>
              <Form.Group>
                <Form.Label as="legend" column>
                  AV Setup
                </Form.Label>
                {filterOptions
                  && filterOptions.avSetups
                  && filterOptions.avSetups.map(x => (
                    <Form.Check
                      name={SELECTED_AV_SETUP}
                      label={x}
                      value={x}
                      key={x}
                    />
                  ))}
              </Form.Group>
            </fieldset>
            <fieldset>
              <Form.Group>
                <Form.Label as="legend" column>
                  Capacity
                </Form.Label>
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      name={SELECTED_MIN_CAPACITY}
                      id={SELECTED_MIN_CAPACITY}
                      placeholder="min"
                      size="sm"
                      min={0}
                      max={1000}
                      step={10}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      name={SELECTED_MAX_CAPACITY}
                      id={SELECTED_MAX_CAPACITY}
                      placeholder="max"
                      size="sm"
                      min={10}
                      max={1000}
                      step={10}
                    />
                  </Col>
                </Row>
              </Form.Group>
            </fieldset>
            <Row className="my-3 justify-content-center">
              <ActionButton>Apply</ActionButton>
            </Row>
          </Form>
        </Col>

        {/* Room selection */}
        <Col className="col-9 ps-3 pe-2">
          <Row>
            <Col>
              <p className="mb-0">
                {allRooms ? `Total results: ${allRooms.length}` : 'No results'}
                <button type="button" className="select-all-btn" onClick={selectAllRooms}>
                  (select all)
                </button>
              </p>
              <p>
                {`Selected: ${context.rooms.length}`}
                {(context.rooms.length > 0)
                  && (
                    <button type="button" className="clear-btn" onClick={clearRooms}>
                      (clear)
                    </button>
                  )}
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
                <Table bordered hover style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th scope="row">
                        <Form.Check id={constants.SELECT_ALL} onClick={handleSelectAll} />
                      </th>
                      <th scope="col">Property</th>
                      <th scope="col">Room</th>
                      <th scope="col">Capacity</th>
                      <th scope="col">Guaranteed Equipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRooms && visibleRooms.map(room => (
                      <tr key={room.RoomID}>
                        <td style={{ height: '3.75rem' }}>
                          <Form.Check
                            name={SELECTED_ROOM}
                            onClick={handleItemSelected}
                            value={room.RoomID}
                          />
                        </td>
                        <td>{room.Property}</td>
                        <td>{room.Room}</td>
                        <td>{room.Capacity}</td>
                        <td>{room.Guaranteed_Equipment}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Row>
              <Row className="justify-content-end">
                <Paginate pageCount={pageCount} onPageChange={handlePageChange} />
                <NavButton variant="secondary" onClick={handleNavBackClicked}>
                  Back
                </NavButton>
                <NavButton
                  type="submit"
                  className="ms-2"
                  disabled={!submitEnabled}
                >
                  Submit
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

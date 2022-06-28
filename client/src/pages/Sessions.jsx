import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import ActionButton from '../components/ActionButton';
import NavButton from '../components/NavButton';
import { getCheckboxValues, truncate } from '../utils/helpers';
import { useSchedulerContext } from '../data/scheduler-context';
import ConfirmModal from '../components/ConfirmModal';
import api from '../utils/api';
import constants from '../config/constants';
import Paginate from '../components/Paginate';

const SELECTED_SESSION = 'selectedSession';
const SELECTED_FORMAT = 'selectedFormat';
const SELECTED_TOPIC = 'selectedTopic';
const SELECTED_TYPE = 'selectedType';

/*
 * Gets the selected filters.
 *
 * @param elements a NodeList of elements from the filters form
 * @returns an object containing the filter selections
 */
const getFilters = elements => {
  // These are the names of the form input fields for the filters
  const { selectedFormat, selectedType, selectedTopic } = elements;

  return {
    formats: getCheckboxValues(selectedFormat),
    types: getCheckboxValues(selectedType),
    topics: getCheckboxValues(selectedTopic),
  };
};

const findSessionById = (list, id) => {
  if (list === undefined) {
    return undefined;
  }
  return list.find(s => s.SessionID === parseInt(id, 10));
};

const findSessionIndexById = (list, id) => {
  if (list === undefined) {
    return undefined;
  }
  return list.findIndex(s => s.SessionID === parseInt(id, 10));
};

export default function Sessions() {
  const [sessions, setSessions] = useState(null);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const context = useSchedulerContext();
  const navigate = useNavigate();

  // Pagination variables
  const [visibleSessions, setVisibleSessions] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [sessionOffset, setSessionOffset] = useState(0);

  // All the filters that to be shown to the user
  const [filterOptions, setFilterOptions] = useState({
    formats: null,
    types: null,
    topics: null,
  });
  // Fetch filters on the first render
  useEffect(() => {
    if (filterOptions.formats != null) {
      // Already fetched the filters
      return;
    }
    // supplies the filter options
    api.getFilterOptionSessions()
      .then(data => {
        setFilterOptions({
          formats: data.Format ?? [],
          types: data.Type ?? [],
          topics: data.Topic ?? [],
        });
      })
      .catch(() => {
        console.log('Unable to load filters');
        // Set default values
        setFilterOptions({
          formats: [],
          types: [],
          topics: [],
        });
      });
  });

  // Fetch unscheduled sessions on first render
  // and whenever the filter selections change
  useEffect(() => {
    if (filterOptions.formats == null) {
      // Filters have not been fetched yet
      return;
    }
    // From each filter category use the user's selected filter(s) if there are any,
    // if there are non selected, select all valid options
    const filters = {
      formats: (context.filters.formats.length > 0)
        ? context.filters.formats : filterOptions.formats,
      types: (context.filters.types.length > 0)
        ? context.filters.types : filterOptions.types,
      topics: (context.filters.topics.length > 0)
        ? context.filters.topics : filterOptions.topics,
    };

    api.filterSessions(filters)
      .then(data => {
        setSessions(data);
        setPageCount(Math.ceil(data.length / constants.RESULTS_PER_PAGE));
      })
      .catch(() => {
        // TODO: handle errors gracefully
        throw new Error('Could not fetch sessions');
      });
  }, [context.filters, filterOptions]);

  // Restore state of selections from context
  useEffect(() => {
    if (!visibleSessions) {
      return;
    }
    if (context.filters.formats.length > 0) {
      document.getElementsByName(SELECTED_FORMAT).forEach(checkbox => {
        checkbox.checked = context.filters.formats.includes(checkbox.value);
      });
    }
    if (context.filters.types.length > 0) {
      document.getElementsByName(SELECTED_TYPE).forEach(checkbox => {
        checkbox.checked = context.filters.types.includes(checkbox.value);
      });
    }
    if (context.filters.topics.length > 0) {
      document.getElementsByName(SELECTED_TOPIC).forEach(checkbox => {
        checkbox.checked = context.filters.topics.includes(checkbox.value);
      });
    }

    setNextButtonEnabled(context.sessions.length > 0);
    let count = 0;
    document.getElementsByName(SELECTED_SESSION).forEach(checkbox => {
      const session = findSessionById(context.sessions, checkbox.value);
      checkbox.checked = (session !== undefined);
      if (checkbox.checked) {
        count += 1;
      }
    });
    const selectAllCheckbox = document.getElementById(constants.SELECT_ALL);
    selectAllCheckbox.checked = (count === visibleSessions.length);
  }, [context.sessions, context.filters, filterOptions, visibleSessions]);

  // Sets which sessions are currently visible
  useEffect(() => {
    if (sessions == null) {
      return;
    }
    const endOffset = sessionOffset + constants.RESULTS_PER_PAGE;
    setVisibleSessions(sessions.slice(sessionOffset, endOffset));
  }, [sessionOffset, sessions]);

  const handlePageChange = event => {
    setSessionOffset((event.selected * constants.RESULTS_PER_PAGE) % sessions.length);
  };

  const handleApplyFiltersClicked = event => {
    const filters = getFilters(event.target.elements);
    event.preventDefault();
    event.stopPropagation();
    // Triggers effect to fetch sessions using new filters
    context.setFilters(filters);
  };

  // Enables the submit button if one or more items are selected
  const handleItemSelected = event => {
    const checkbox = event.target;

    if (checkbox.checked && !context.sessions.includes(checkbox.value)) {
      const sessionToAdd = findSessionById(visibleSessions, checkbox.value);
      context.sessions.push(sessionToAdd);
    } else { // Remove the session
      const indexToRemove = findSessionIndexById(context.sessions, checkbox.value);
      context.sessions.splice(indexToRemove, 1);
    }
    // Create a shallow copy of the modified array to trigger a state change
    context.setSessions(Array.from(context.sessions));
  };

  // Toggles all the checkboxes and the submit button
  const handleSelectAll = event => {
    const selectAllCheckbox = event.target;
    const sessionCheckboxes = document.getElementsByName(SELECTED_SESSION);

    if (selectAllCheckbox.checked) {
      sessionCheckboxes.forEach(checkbox => {
        const sessionToAdd = findSessionById(visibleSessions, checkbox.value);
        if (!context.sessions.includes(sessionToAdd)) {
          context.sessions.push(sessionToAdd);
        }
      });
    } else { // Remove the sessions
      sessionCheckboxes.forEach(checkbox => {
        const indexToRemove = findSessionIndexById(context.sessions, checkbox.value);
        context.sessions.splice(indexToRemove, 1);
      });
    }
    // Create a shallow copy of the modified array to trigger a state change
    context.setSessions(Array.from(context.sessions));
  };

  const handleNavNextClicked = event => {
    event.preventDefault();
    event.stopPropagation();
    navigate('/dates');
  };

  const handleNavBackClicked = () => {
    setShowDiscardConfirmation(true);
  };

  const onDiscardClicked = () => {
    context.reset();
    navigate(-1); // Equivalent to clicking browser back button
  };

  const clearSessions = () => {
    context.setSessions([]);
  };

  const selectAllSessions = () => {
    context.setSessions(sessions);
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

      <ConfirmModal
        show={showDiscardConfirmation}
        positiveActionName="Discard"
        onPositiveAction={onDiscardClicked}
        onNegativeAction={() => setShowDiscardConfirmation(false)}
      >
        Are you sure you want to discard changes?
      </ConfirmModal>

      <Row className="section-header">
        <h1>Step 1: Select Sessions</h1>
      </Row>

      <Row>
        {/* Filters */}
        <Col className="col -3 left-menu">
          <Form onSubmit={handleApplyFiltersClicked}>
            <p className="text-center menu-title">Filters</p>
            <fieldset>
              <Form.Group>
                <Form.Label as="legend" column>
                  Session Format
                </Form.Label>
                {filterOptions.formats && filterOptions.formats.map(x => (
                  <Form.Check
                    name={SELECTED_FORMAT}
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
                  Program Types
                </Form.Label>
                {filterOptions.types && filterOptions.types.map(x => (
                  <Form.Check
                    name={SELECTED_TYPE}
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
                  Topics
                </Form.Label>
                {filterOptions.topics && filterOptions.topics.map(x => (
                  <Form.Check
                    name={SELECTED_TOPIC}
                    label={x}
                    value={x}
                    key={x}
                  />
                ))}
              </Form.Group>
            </fieldset>
            <Row className="my-3 justify-content-center">
              <ActionButton>Apply</ActionButton>
            </Row>
          </Form>
        </Col>

        {/* Session selection */}
        <Col className="col-9 ps-3 pe-2">
          <Row>
            <Col>
              <p className="mb-0">
                {sessions ? `Total results: ${sessions.length}` : 'No results'}
                <button type="button" className="select-all-btn" onClick={selectAllSessions}>
                  (select all)
                </button>
              </p>
              <p>
                {`Selected: ${context.sessions.length}`}
                {(context.sessions.length > 0)
                  && (
                    <button type="button" className="clear-btn" onClick={clearSessions}>
                      (clear)
                    </button>
                  )}
              </p>
            </Col>
            <Col className="text-end">
              <p>{`Showing ${getPageRangeString()}`}</p>
            </Col>
          </Row>
          <Form onSubmit={handleNavNextClicked} style={{ height: '100%' }}>
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
                      <th scope="col">Title</th>
                      <th scope="col">Format</th>
                      <th scope="col">Type</th>
                      <th scope="col">Topic</th>
                      <th scope="col">Est. Seating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSessions && visibleSessions.map(session => (
                      <tr key={session.SessionID}>
                        <td style={{ height: '3.75rem' }}>
                          <Form.Check
                            name={SELECTED_SESSION}
                            onClick={handleItemSelected}
                            value={session.SessionID}
                          />
                        </td>
                        <td>{truncate(session.Title, constants.MAX_STRING_LENGTH)}</td>
                        <td>{truncate(session.Format, constants.MAX_STRING_LENGTH)}</td>
                        <td>{truncate(session.Type, constants.MAX_STRING_LENGTH)}</td>
                        <td>{truncate(session.Topic, constants.MAX_STRING_LENGTH)}</td>
                        <td>{truncate(session.EstSeating, constants.MAX_STRING_LENGTH)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Row>
              <Row className="mt-3 justify-content-end">
                <Paginate pageCount={pageCount} onPageChange={handlePageChange} />
                <NavButton variant="secondary" onClick={handleNavBackClicked}>
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

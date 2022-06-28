import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import NavButton from '../components/NavButton';
import Paginate from '../components/Paginate';
import ConfirmModal from '../components/ConfirmModal';
import constants from '../config/constants';
import api from '../utils/api';

const SELECTED_HOTEL = 'selectedHotel';

export default function Hotels() {
  const [allHotels, setAllHotels] = useState(null);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  // Pagination variables
  const [visibleHotels, setVisibleHotels] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [hotelOffset, setHotelOffset] = useState(0);

  // Fetch all hotels on first render
  useEffect(() => {
    api.getHotels()
      .then(res => {
        setAllHotels(res);
        setPageCount(Math.ceil(res.length / constants.RESULTS_PER_PAGE));
      }).catch(() => {
        throw new Error('Error filtering rooms');
      });
  }, []);

  // Restores state of checkbox selections on re-render
  useEffect(() => {
    if (!visibleHotels) {
      return;
    }

    let count = 0;
    document.getElementsByName(SELECTED_HOTEL).forEach(checkbox => {
      checkbox.checked = selectedHotels.includes(checkbox.value);
      if (checkbox.checked) {
        count += 1;
      }
    });

    setSubmitEnabled(selectedHotels.length > 0);
    const selectAllCheckbox = document.getElementById(constants.SELECT_ALL);
    selectAllCheckbox.checked = (count === visibleHotels.length);
  }, [visibleHotels, selectedHotels]);

  // Calculates the subset of rooms to show on the current page
  useEffect(() => {
    if (allHotels == null) {
      return;
    }
    const endOffset = hotelOffset + constants.RESULTS_PER_PAGE;
    setVisibleHotels(allHotels.slice(hotelOffset, endOffset));
  }, [hotelOffset, allHotels]);

  const handlePageChange = event => {
    setHotelOffset((event.selected * constants.RESULTS_PER_PAGE) % allHotels.length);
  };

  const handleSubmitClicked = event => {
    event.preventDefault();
    event.stopPropagation();
    setShowSubmitConfirmation(true);
  };

  // Deletes the room entries in the database
  const handleConfirmClicked = () => {
    if (selectedHotels.length === 0) {
      return;
    }
    api.deleteHotels(selectedHotels)
      .then(res => {
        const notDeleted = res.data; // Array of hotels that could not be deleted

        if (notDeleted.length === 0) {
          // All selected hotels were deleted successfully
          const remaining = allHotels.filter(h => !selectedHotels.includes(h));
          setAllHotels(remaining);
          setPageCount(Math.ceil(remaining.length / constants.RESULTS_PER_PAGE));
        } else if (notDeleted.length < selectedHotels.length) {
          // Some hotels were deleted but not all
          const deleted = selectedHotels.filter(h => !notDeleted.includes(h));
          const remaining = allHotels.filter(h => !deleted.includes(h));
          setAllHotels(remaining);
          setPageCount(Math.ceil(remaining.length / constants.RESULTS_PER_PAGE));
          alert(`Not able to delete ${notDeleted} because bookings exists`);
        } else if (notDeleted.length === selectedHotels.length) {
          // None of the hotel selections where deleted
          alert(`Not able to delete ${notDeleted} because bookings exists`);
        }
      }).catch(() => {
        console.error('Unhandled error');
      });

    setSelectedHotels([]);
    setShowSubmitConfirmation(false);
  };

  const handleItemSelected = ({ target: checkbox }) => {
    if (checkbox.checked && !selectedHotels.includes(checkbox.value)) {
      const hotelToAdd = visibleHotels.find(e => e === checkbox.value);
      selectedHotels.push(hotelToAdd);
    } else { // Remove the hotel
      const indexToRemove = selectedHotels.findIndex(e => e === checkbox.value);
      selectedHotels.splice(indexToRemove, 1);
    }
    // Shallow copy to trigger a state change and re-render
    setSelectedHotels(Array.from(selectedHotels));
    setSubmitEnabled(selectedHotels.length > 0);
  };

  const handleSelectAll = ({ target: selectAllCheckbox }) => {
    const roomCheckboxes = document.getElementsByName(SELECTED_HOTEL);

    if (selectAllCheckbox.checked) {
      roomCheckboxes.forEach(checkbox => {
        const hotelToAdd = visibleHotels.find(e => e === checkbox.value);
        if (!selectedHotels.includes(hotelToAdd)) {
          selectedHotels.push(hotelToAdd);
        }
      });
    } else { // Remove the room
      roomCheckboxes.forEach(checkbox => {
        const indexToRemove = selectedHotels.findIndex(e => e === checkbox.value);
        selectedHotels.splice(indexToRemove, 1);
      });
    }
    // Shallow copy to trigger a state change and re-render
    setSelectedHotels(Array.from(selectedHotels));
    setSubmitEnabled(selectedHotels.length > 0);
  };

  const clearRoomSelections = () => {
    setSelectedHotels([]);
    setSubmitEnabled(false);
  };

  // Returns a string representing the index range of results
  const getPageRangeString = () => {
    if (!visibleHotels || (visibleHotels.length === 0)) {
      return '0';
    }
    const endOffset = hotelOffset + visibleHotels.length;
    return `${hotelOffset + 1}-${endOffset}`;
  };

  return (
    <Container className="main-components">
      <ConfirmModal
        show={showSubmitConfirmation}
        positiveActionName="Delete forever"
        negativeActionName="Never mind"
        onPositiveAction={handleConfirmClicked}
        onNegativeAction={() => setShowSubmitConfirmation(false)}
      >
        Are you sure you want to delete the selected rooms?
      </ConfirmModal>

      <Row className="section-header">
        <h1>View Hotel Information</h1>
      </Row>

      <Row>
        {/* Hotel selection */}
        <Col className="ps-3 pe-3">
          <Row>
            <Col>
              <p className="mb-0">
                {allHotels ? `Total results: ${allHotels.length}` : 'No results'}
              </p>
              <p>
                {`Selected: ${selectedHotels.length}`}
                {(selectedHotels.length > 0)
                  && (
                    <button type="button" className="clear-btn" onClick={clearRoomSelections}>
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
                      <th scope="col">Hotel Name</th>
                      <th scope="col">Hotel Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleHotels && visibleHotels.map(hotel => (
                      <tr key={hotel}>
                        <td style={{ height: '3.75rem' }}>
                          <Form.Check
                            name={SELECTED_HOTEL}
                            onClick={handleItemSelected}
                            value={hotel}
                          />
                        </td>
                        <td>{hotel}</td>
                        <td>No info</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Row>
              <Row className="mt-3 justify-content-end">
                <Paginate pageCount={pageCount} onPageChange={handlePageChange} />
                <NavButton
                  type="submit"
                  variant="danger"
                  disabled={!submitEnabled}
                >
                  Delete
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

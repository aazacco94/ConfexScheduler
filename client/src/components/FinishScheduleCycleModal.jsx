import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
//import api from '../utils/api';

export default function FinishedScheduleCycleModal(props) {
  // const [numLeft, setNumLeft] = useState(null);
  const {
    show,
    message,
    disable,
  } = props;
  const navigate = useNavigate();

  const checkScheduleClicked = event => {
    event.preventDefault();
    event.stopPropagation();
    navigate('/scheduled');
  };

  const returnToSessionsPageClicked = event => {
    event.preventDefault();
    event.stopPropagation();
    navigate('/sessions');
  };

  return (
    <>
      <Modal
        keyboard={false}
        show={show}
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={returnToSessionsPageClicked}
            disabled={disable}
          >
            Continue Scheduling
          </Button>
          <Button variant="primary" onClick={checkScheduleClicked}>
            View Schedule
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

FinishedScheduleCycleModal.propTypes = {
  show: PropTypes.bool,
  message: PropTypes.string,
  disable: PropTypes.bool,
};

FinishedScheduleCycleModal.defaultProps = {
  show: false,
  message: 'Unknown',
  disable: PropTypes.bool,
};

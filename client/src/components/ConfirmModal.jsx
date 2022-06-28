import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

export default function ConfirmModal(props) {
  const {
    show,
    negativeActionName,
    positiveActionName,
    onNegativeAction,
    onPositiveAction,
    children,
  } = props;

  return (
    <Modal show={show} onHide={onNegativeAction}>
      <Modal.Header closeButton>
        <Modal.Title>{positiveActionName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onNegativeAction} variant="secondary">
          {negativeActionName}
        </Button>
        <Button onClick={onPositiveAction} variant="primary">
          {positiveActionName}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  show: PropTypes.bool,
  negativeActionName: PropTypes.string,
  positiveActionName: PropTypes.string.isRequired,
  onNegativeAction: PropTypes.func,
  onPositiveAction: PropTypes.func,
  children: PropTypes.node.isRequired,
};

ConfirmModal.defaultProps = {
  show: true,
  negativeActionName: 'Cancel',
  onNegativeAction: () => {},
  onPositiveAction: () => {},
};

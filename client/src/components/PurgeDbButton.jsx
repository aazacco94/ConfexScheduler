import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import ConfirmModal from './ConfirmModal';
import api from '../utils/api';

export default function PurgeDbButton({ onPurge, dbType }) {
  const [isVisible, setVisible] = useState(false);
  const handlePurge = () => {
    const db = dbType.split(' ');
    api.purgeDb(db[0])
      .then(() => {
        onPurge();
      });
    setVisible(false);
  };

  return (
    <>
      <ConfirmModal
        show={isVisible}
        positiveActionName="Confirm"
        onPositiveAction={handlePurge}
        onNegativeAction={() => setVisible(false)}
      >
        &emsp; &emsp; &emsp; &emsp; &emsp; &emsp;
          &emsp; &emsp; &emsp; &emsp; &emsp;
        <b>WARNING!!</b>
        <div>
          <br />
          Are you sure you would like to delete
          <b> ALL </b>
          items stored in the
          {' '}
          {dbType}
          {' '}
          database?
        </div>
      </ConfirmModal>

      <div>
        <Button className="del-btn" onClick={() => { setVisible(true); }} size="sm">
          Delete
          {' '}
          {dbType}
        </Button>
      </div>
    </>
  );
}

PurgeDbButton.propTypes = {
  onPurge: PropTypes.func,
  dbType: PropTypes.string,
};

PurgeDbButton.defaultProps = {
  onPurge: () => {},
  dbType: 'Database',
};

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

export default function ActionButton({ children }) {
  return (
    <Button
      className="action-button"
      variant="outline-secondary"
      size="sm"
      type="submit"
    >
      {children}
    </Button>
  );
}

ActionButton.propTypes = {
  children: PropTypes.string.isRequired,
};

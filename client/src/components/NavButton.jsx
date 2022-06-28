import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

export default function NavButton(props) {
  const {
    className,
    type,
    variant,
    disabled,
    onClick,
    children,
  } = props;

  return (
    <Button
      className={className}
      type={type}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      style={{ width: '75px' }}
    >
      {children}
    </Button>
  );
}

NavButton.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.string.isRequired,
};

NavButton.defaultProps = {
  className: '',
  type: 'button',
  variant: 'primary',
  disabled: false,
  onClick: () => null,
};

import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';

export default function InfoHover({
  className, size, keyName, message,
}) {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={keyName} key={keyName}>{message}</Tooltip>}
    >
      <InfoOutline
        data-testid={keyName}
        className={className}
        style={{ height: size, width: size, verticalAlign: 'top' }}
      />
    </OverlayTrigger>
  );
}

InfoHover.defaultProps = {
  className: 'float-top',
  size: '15px',
};

InfoHover.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  keyName: PropTypes.string.isRequired, // pass in a unique, descriptive key for your info hover
  message: PropTypes.string.isRequired,
};

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const LoadingMessage = (props) => {
  const { className } = props;
  return (
    <div
      className={classNames(
        'loading d-flex align-items-center justify-content-center',
        className,
      )}
    >
      Loading...
      <span className="sr-only">
        <FormattedMessage
          id="admin.portal.loading.message"
          defaultMessage="Loading"
          descriptino="Loading message for the admin portal."
        />
      </span>
    </div>
  );
};

LoadingMessage.propTypes = {
  className: PropTypes.string.isRequired,
};

export default LoadingMessage;

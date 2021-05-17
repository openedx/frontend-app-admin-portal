import React from 'react';
import PropTypes from 'prop-types';
import { displayCode, displayEmail, displaySelectedCodes } from '../CodeModal/codeModalHelpers';

const CodeDetails = ({
  isBulkRemind, hasIndividualRemindData, data, numberOfSelectedCodes,
}) => (
  <div className="assignment-details mb-4">
    {!isBulkRemind && hasIndividualRemindData && (
    <>
      <p data-hj-suppress>{displayCode(data.code)}</p>
      <p data-hj-suppress>{displayEmail(data.email)}</p>
    </>
    )}
    {isBulkRemind && numberOfSelectedCodes > 0 && (
    <>
      <p className="bulk-selected-codes">{displaySelectedCodes(numberOfSelectedCodes)}</p>
    </>
    )}
  </div>
);

CodeDetails.defaultProps = {
  numberOfSelectedCodes: 0,
};

CodeDetails.propTypes = {
  isBulkRemind: PropTypes.bool.isRequired,
  hasIndividualRemindData: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    code: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  numberOfSelectedCodes: PropTypes.number,
};

export default CodeDetails;

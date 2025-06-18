import React from 'react';
import PropTypes from 'prop-types';
import { formatPrice } from './data';

const RequestAmountTableCell = ({ row }) => <>-{formatPrice(row.original.amount / 100)}</>;

RequestAmountTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string,
      email: PropTypes.string,
      courseId: PropTypes.string.isRequired,
      courseTitle: PropTypes.string,
      amount: PropTypes.number,
      requestStatus: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default RequestAmountTableCell;

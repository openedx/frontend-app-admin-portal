import PropTypes from 'prop-types';
import { formatPrice } from '../data';

const AmountCell = ({ row }) => {
  const formattedContentPrice = formatPrice(row.original.amount);
  return (
    <div>-{formattedContentPrice}</div>
  );
};

AmountCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      amount: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AmountCell;

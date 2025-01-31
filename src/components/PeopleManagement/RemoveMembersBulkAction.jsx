import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { getSelectedEmailsByRow } from './utils';

const RemoveMembersBulkAction = ({
  isEntireTableSelected,
  selectedFlatRows,
  onHandleRemoveMembersBulkAction,
  learnerEmails,
}) => {
  const handleOnClick = async () => {
    if (isEntireTableSelected) {
      onHandleRemoveMembersBulkAction(learnerEmails);
    }
    const emails = getSelectedEmailsByRow(selectedFlatRows);
    onHandleRemoveMembersBulkAction(emails);
  };

  return (
    <Button variant="brand" onClick={handleOnClick}>
      Remove
    </Button>
  );
};

RemoveMembersBulkAction.defaultProps = {
  selectedFlatRows: null,
};

RemoveMembersBulkAction.propTypes = {
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()),
  onHandleRemoveMembersBulkAction: PropTypes.func.isRequired,
  isEntireTableSelected: PropTypes.bool,
};

export default RemoveMembersBulkAction;

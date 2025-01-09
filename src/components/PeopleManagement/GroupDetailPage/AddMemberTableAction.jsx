import { Button } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

const AddMemberTableAction = ({ openModal }) => (
  <Button
    className="align-top"
    iconBefore={Add}
    onClick={openModal}
    variant="outline-primary"
  >Add members
  </Button>
);

AddMemberTableAction.propTypes = {
  openModal: PropTypes.func.isRequired,
};

export default AddMemberTableAction;

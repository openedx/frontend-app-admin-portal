import { Form } from '@edx/paragon';
import PropTypes from 'prop-types';

const MembersTableSwitchFilter = ({ column: { filterValue, setFilter } }) => (
  <Form.Switch
    className="ml-2.5 mt-2.5"
    checked={filterValue || false}
    onChange={() => {
      setFilter(!filterValue || false); // Set undefined to remove the filter entirely
    }}
    data-testid="show-removed-toggle"
  >
    Show removed
  </Form.Switch>
);

MembersTableSwitchFilter.propTypes = {
  /**
   * Specifies a column object.
   *
   * `setFilter`: Function to set the filter value.
   *
   * `filterValue`: Value for the filter input.
   */
  column: PropTypes.shape({
    setFilter: PropTypes.func.isRequired,
    Header: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]).isRequired,
    filterValue: PropTypes.bool,
  }).isRequired,
};

export default MembersTableSwitchFilter;

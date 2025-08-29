import React, { useMemo, useRef } from 'react';
import {
  Form,
  Stack,
  Badge,
  FormLabel,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

let lastId = 0;

export const newId = (prefix = 'id') => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

// BudgetCheckboxFilter builds on top of Paragon's CheckboxFilter component to support preselected filtering
// where the checkboxes are checked based on the filterValue.
// https://github.com/openedx/paragon/blob/release-23.x/src/DataTable/filters/CheckboxFilter.jsx

const BudgetCheckboxFilter = ({
  column: {
    filterValue, setFilter, Header, filterChoices, getHeaderProps,
  },
}) => {
  const ariaLabel = useRef(newId(`checkbox-filter-label-${getHeaderProps().key}-`));

  const checkedBoxes = filterValue || [];

  const changeCheckbox = (value) => {
    if (checkedBoxes.includes(value)) {
      const newCheckedBoxes = checkedBoxes.filter((val) => val !== value);
      return setFilter(newCheckedBoxes);
    }
    checkedBoxes.push(value);
    return setFilter(checkedBoxes);
  };
  const headerBasedId = useMemo(() => `checkbox-filter-check-${getHeaderProps().key}-`, [getHeaderProps]);

  return (
    <Form.Group role="group" aria-labelledby={ariaLabel.current}>
      <FormLabel id={ariaLabel.current} className="pgn__checkbox-filter-label">{Header}</FormLabel>
      {/* To add support to preselected filters in the paragon CheckboxFilter, include the value prop */}
      <Form.CheckboxSet name={Header} value={checkedBoxes}>
        {filterChoices.map(({ name, number, value }) => (
          <Form.Checkbox
            key={`${headerBasedId}${name}`}
            value={name}
            checked={checkedBoxes.includes(value)}
            onChange={() => changeCheckbox(value)}
            aria-label={name}
          >
            <Stack direction="horizontal" gap={2}>
              {name} {number !== undefined && <Badge variant="light">{number}</Badge>}
            </Stack>
          </Form.Checkbox>
        ))}
      </Form.CheckboxSet>
    </Form.Group>
  );
};

BudgetCheckboxFilter.propTypes = {
  column: PropTypes.shape({
    setFilter: PropTypes.func.isRequired,
    Header: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]).isRequired,
    filterChoices: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      number: PropTypes.number,
    })).isRequired,
    getHeaderProps: PropTypes.func.isRequired,
    filterValue: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default BudgetCheckboxFilter;

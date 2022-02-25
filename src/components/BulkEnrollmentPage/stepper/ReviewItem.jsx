import React from 'react';
import { Delete } from '@edx/paragon/icons';
import {
  Card, IconButton, Icon,
} from '@edx/paragon';
import PropTypes from 'prop-types';

import { deleteSelectedRowAction } from '../data/actions';

const ReviewItem = ({
  row, accessor, dispatch, altText,
}) => {
  const onClick = () => {
    dispatch(deleteSelectedRowAction(row.id));
  };

  return (
    <li>
      <Card>
        <Card.Section>
          <div className="list-item">
            <span className="list-item-text">{row.values[accessor]}</span>
            <IconButton
              src={Delete}
              iconAs={Icon}
              data-testid="delete-button"
              alt={altText}
              onClick={onClick}
              title={altText}
            />
          </div>
        </Card.Section>
      </Card>
    </li>
  );
};

ReviewItem.propTypes = {
  /* Selected row from a DataTable instance */
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    values: PropTypes.shape({}).isRequired,
  }).isRequired,
  /* The accessor for the text that will be displayed for this row. Should be on the object row.values */
  accessor: PropTypes.string.isRequired,
  /* For dispatching actions on the rows. Will dispatch the deleteSelectedRowAction */
  dispatch: PropTypes.func.isRequired,
  /* Is used as label text on hover as well as Aria label for screenreaders for the remove button. */
  altText: PropTypes.string.isRequired,
};

export default ReviewItem;

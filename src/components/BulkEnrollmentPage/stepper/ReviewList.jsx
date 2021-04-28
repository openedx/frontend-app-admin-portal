import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, useToggle,
} from '@edx/paragon';
import ReviewItem from './ReviewItem';

const ShowHideButton = ({
  isShowingAll, showAll, show25, numRows, subject,
}) => {
  if (numRows < 25) {
    return null;
  }
  if (!isShowingAll) {
    return <Button variant="link" size="inline" onClick={showAll}>Show {numRows - 25} more {subject.plural}</Button>;
  }

  return <Button variant="link" size="inline" onClick={show25}>Hide {numRows - 25} {subject.plural}</Button>;
};

ShowHideButton.propTypes = {
  /* User-facing words for the thing being displayed */
  subject: PropTypes.shape({
    singular: PropTypes.string.isRequired,
    plural: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  isShowingAll: PropTypes.bool.isRequired,
  showAll: PropTypes.func.isRequired,
  show25: PropTypes.func.isRequired,
  numRows: PropTypes.number.isRequired,
};

const ReviewList = ({
  rows, accessor, dispatch, subject, returnToSelection,
}) => {
  const [isShowingAll, showAll, show25] = useToggle(false);
  const displayRows = useMemo(() => {
    if (isShowingAll) {
      return rows;
    }
    return rows.slice(0, 25);
  }, [isShowingAll, rows]);

  return (
    <div className="col col-6">
      <h3>{subject.title}</h3>
      <ul className="be-review-list">
        {rows.length < 1 && (
          <Alert variant="danger">
            At least one {subject.singular} must be selected to enroll learners
            <Button variant="link" size="inline" onClick={returnToSelection}>Return to {subject.singular} selection</Button>
          </Alert>
        )}
        {displayRows.map((row) => <ReviewItem key={row.id} row={row} accessor={accessor} dispatch={dispatch} />)}
      </ul>
      <ShowHideButton
        isShowingAll={isShowingAll}
        show25={show25}
        showAll={showAll}
        numRows={rows.length}
        subject={subject}
      />
    </div>
  );
};

ReviewList.propTypes = {
  /* Selected rows from a DataTable instance */
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  /* The accessor for the text that will be displayed for this row. Should be on the object row.values */
  accessor: PropTypes.string.isRequired,
  /* For dispatching actions on the rows */
  dispatch: PropTypes.func.isRequired,
  /* User-facing words for the thing being displayed */
  subject: PropTypes.shape({
    singular: PropTypes.string.isRequired,
    plural: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  /* Function to return the user to the table where these rows were selected */
  returnToSelection: PropTypes.func.isRequired,
};

export default ReviewList;

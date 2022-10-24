import React, { useState } from 'react';
import { Button } from '@edx/paragon';
import { useParams } from 'react-router-dom';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const CurrentContentHighlightItemsHeader = () => {
  const { highlightUUID } = useParams();
  const [highlightTitle] = useState(TEST_COURSE_HIGHLIHTS_DATA.filter(
    highlights => highlights.uuid === highlightUUID,
  )[0].title);
  return (
    <>
      { highlightTitle && (
        <header>
          <div className="d-flex justify-content-between mb-2">
            <div className="align-self-end">
              <h3 className="m-0">
                {highlightTitle}
              </h3>
            </div>
            <div>
              <Button>Delete Highlight</Button>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <p>Cap - Max Courses</p>
          </div>
        </header>
      )}
    </>
  );
};

export default CurrentContentHighlightItemsHeader;

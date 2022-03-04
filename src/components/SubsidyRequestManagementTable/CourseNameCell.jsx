import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import {
  OverlayTrigger,
  Popover,
  Button,
  Hyperlink,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';

import { useCourseDetails } from './data/hooks';

const CourseDetailsPopoverContentBase = ({ enterpriseSlug, courseId }) => {
  const { ENTERPRISE_LEARNER_PORTAL_URL } = getConfig();
  const [courseDetails, isCourseDetailsLoading] = useCourseDetails(courseId);

  if (isCourseDetailsLoading) {
    return (
      <>
        <Skeleton count={2} />
        <span className="sr-only">Loading course details...</span>
      </>
    );
  }

  return (
    <div>
      {(courseDetails?.shortDescription) && (
        <>
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: courseDetails.shortDescription }}
          />
          <hr />
        </>
      )}
      <div>
        <Hyperlink
          target="_blank"
          destination={`${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${courseId}`}
        >
          Learn more about this course
        </Hyperlink>
      </div>
    </div>
  );
};

CourseDetailsPopoverContentBase.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

const CourseDetailsPopoverContent = connect(mapStateToProps)(CourseDetailsPopoverContentBase);

const CourseNameCell = ({ row }) => (
  <OverlayTrigger
    trigger="click"
    placement="top"
    rootClose
    overlay={(
      <Popover id="popover-requests-table-course-details">
        <Popover.Title as="h5">{row.original.courseName}</Popover.Title>
        <Popover.Content>
          <CourseDetailsPopoverContent courseId={row.original.courseId} />
        </Popover.Content>
      </Popover>
    )}
  >
    <Button
      variant="link"
      className="text-left px-0"
      size="sm"
    >
      {row.original.courseName}
    </Button>
  </OverlayTrigger>
);

CourseNameCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      courseName: PropTypes.string,
      courseId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default CourseNameCell;

import { Button, Hyperlink } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import NewAssignmentModalButton from './NewAssignmentModalButton';
import EVENT_NAMES from '../../../eventTracking';
import CARD_TEXT from '../constants';

const { BUTTON_ACTION } = CARD_TEXT;

const CourseCardFooterActions = ({ enterpriseId, course }) => {
  const { linkToCourse, uuid } = course;
  const handleViewCourse = () => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.VIEW_COURSE,
      { courseUuid: uuid },
    );
  };
  return [
    <Button
      key="link-to-course"
      as={Hyperlink}
      data-testid="hyperlink-view-course"
      onClick={handleViewCourse}
      destination={linkToCourse}
      target="_blank"
      variant="outline-primary"
    >
      {BUTTON_ACTION.viewCourse}
    </Button>,
    <NewAssignmentModalButton key="assignment-modal-trigger" course={course}>
      {BUTTON_ACTION.assign}
    </NewAssignmentModalButton>,
  ];
};

CourseCardFooterActions.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  course: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CourseCardFooterActions);

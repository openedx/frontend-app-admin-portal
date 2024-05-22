import { Button, Hyperlink } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import NewAssignmentModalButton from '../assignment-modal/NewAssignmentModalButton';
import EVENT_NAMES from '../../../eventTracking';

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
      <FormattedMessage
        id="lcm.budget.detail.page.catalog.tab.course.card.view.course"
        defaultMessage="View course"
        description="Button text to view course"
      />
    </Button>,
    <NewAssignmentModalButton key="assignment-modal-trigger" course={course}>
      <FormattedMessage
        id="lcm.budget.detail.page.catalog.tab.course.card.assign"
        defaultMessage="Assign"
        description="Button text to assign course"
      />
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

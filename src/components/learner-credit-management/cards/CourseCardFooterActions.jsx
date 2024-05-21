import { Button, Hyperlink } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useBudgetId, useSubsidyAccessPolicy, useEnterpriseGroup } from '../data';
import NewAssignmentModalButton from '../assignment-modal/NewAssignmentModalButton';
import EVENT_NAMES from '../../../eventTracking';

const CourseCardFooterActions = ({ enterpriseId, course }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const { data: { appliesToAllContexts } } = useEnterpriseGroup(subsidyAccessPolicy);

  const catalogGroupView = subsidyAccessPolicy?.groupAssociations?.length > 0
    && !appliesToAllContexts;

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
    (!catalogGroupView ? (
      <NewAssignmentModalButton key="assignment-modal-trigger" course={course}>
        <FormattedMessage
          id="lcm.budget.detail.page.catalog.tab.course.card.assign"
          defaultMessage="Assign"
          description="Button text to assign course"
        />
      </NewAssignmentModalButton>
    ) : null),
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

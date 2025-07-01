import { ReactNode, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import { ADMIN_TOUR_EVENT_NAMES, ORGANIZE_LEARNER_TARGETS } from './constants';
import messages from './messages';
import LmsApiService from '../../../data/services/LmsApiService';
import { flowUuids } from '../../../config';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { useEnterpriseMembersTableData } from '../../PeopleManagement/data/hooks';
import { useSingleEnterpriseCustomerMember } from './hooks';
import { TourStep } from '../types';

interface useCreateOrganizeLearnersFlowProps {
  enterpriseSlug: string;
  adminUuid: string;
  enterpriseId: string;
}

const useCreateOrganizeLearnersFlow = (
  { enterpriseSlug, adminUuid, enterpriseId }: useCreateOrganizeLearnersFlowProps,
): Array<TourStep> => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const enterpriseMemberId = useSingleEnterpriseCustomerMember(enterpriseId);

  const handleAdvanceTour = useCallback(() => {
    const newIndex = stepIndex + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME, { 'completed-step': newIndex });
    setStepIndex(newIndex);
  }, [enterpriseSlug, stepIndex]);

  const handleAdvanceToDetailPage = useCallback(() => {
    console.log('in new advance??');
    const newIndex = stepIndex + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME, { 'completed-step': newIndex });
    setStepIndex(newIndex);
  }, [enterpriseSlug, stepIndex]);

  const handleEndTour = async () => {
    try {
      sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuids.ORGANIZE_LEARNERS_UUID);
    } catch (error) {
      logError(error);
    }
  };

  const tour: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.ORGANIZE_LEARNERS_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepTwoBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepFourBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_HIGHLIGHT}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepFiveBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepSixBody),
    onAdvance: handleAdvanceToDetailPage,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_DETAIL_PAGE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepSevenBody),
    onAdvance: handleEndTour,
  },
  ];

  return tour;
};

export default useCreateOrganizeLearnersFlow;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { ADMIN_TOUR_EVENT_NAMES, ORGANIZE_LEARNER_TARGETS } from '../constants';
import messages from '../messages';
import { configuration } from '../../../../config';
import { TourStep } from '../../types';
import { useAllFlexEnterpriseGroups } from '../../../learner-credit-management/data';
import useHasEnterpriseMembers from '../data/useHasEnterpriseMembers';

interface OrganizeLearnersFlowProps {
  currentStep: number;
  enterpriseId: string;
  enterpriseSlug: string;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  setCurrentStep: (step: number) => void;
  targetSelector?: string;
}

const OrganizeLearnersFlow = ({
  currentStep, enterpriseId, enterpriseSlug, handleEndTour, setCurrentStep, targetSelector,
}: OrganizeLearnersFlowProps): Array<TourStep> => {
  const intl = useIntl();
  const params = useParams();
  const { data } = useAllFlexEnterpriseGroups(enterpriseId);
  const { data: hasEnterpriseMembers } = useHasEnterpriseMembers(enterpriseId);
  const [hasGroups, setHasGroups] = useState<Boolean>(false);

  const groupUuid = params['*']?.split('/')[0];
  const isOnGroupDetailPage = !!groupUuid;

  function handleAdvanceTour(advanceEventName: string) {
    const newIndex = currentStep + 1;
    const viewGroupButton = document.getElementById('view-group-button');
    if (viewGroupButton && targetSelector === ORGANIZE_LEARNER_TARGETS.ORG_GROUP_CARD) {
      viewGroupButton.click();
      setCurrentStep(0);
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
      return;
    }

    const detailPageTargets = [
      ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_CARD,
      ORGANIZE_LEARNER_TARGETS.VIEW_GROUP_PROGRESS,
      ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_TABLE,
      ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_BREADCRUMBS,
    ];

    if (detailPageTargets.includes(targetSelector as string)) {
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': 6 + newIndex });
    } else {
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    }
    setCurrentStep(newIndex);
  }

  const onOrganizeAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME);
  const onOrganizeEnd = () => handleEndTour(
    ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME,
    configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ORGANIZE_LEARNERS_UUID,
  );

  useEffect(() => {
    if (data) {
      if (data?.length > 0) {
        setHasGroups(true);
      } else {
        setHasGroups(false);
      }
    }
  }, [data]);

  const tourNoMembers: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneNoMembersBody),
    onAdvance: onOrganizeEnd,
  }];

  // Flow if org has no groups, does not navigate away from page
  const tourNoGroups: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepTwoBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepFourBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepFiveBody),
    onEnd: onOrganizeEnd,
  }];

  // If org has groups, after step 6 we navigate away to the group detail page
  const tourWithGroups: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepTwoBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepFourBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepFiveBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUP_CARD}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepSixBody),
    onEnd: onOrganizeAdvance,
  }];

  const groupDetailTour: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_CARD}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepSevenBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.VIEW_GROUP_PROGRESS}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepEightBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_TABLE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepNineBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_BREADCRUMBS}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepTenBody),
    onEnd: onOrganizeEnd,
  }];

  if (!hasEnterpriseMembers) {
    return tourNoMembers;
  }
  if (isOnGroupDetailPage) {
    return groupDetailTour;
  }
  if (hasGroups) {
    return tourWithGroups;
  }

  return tourNoGroups;
};

export default OrganizeLearnersFlow;

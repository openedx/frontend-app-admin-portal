import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import { ADMIN_TOUR_EVENT_NAMES, ORGANIZE_LEARNER_TARGETS } from '../constants';
import messages from '../messages';
import { configuration } from '../../../../config';
import { TourStep } from '../../types';
import useHydrateAdminOnboardingData, { HydratedAdminOnboardingData } from '../data/useHydrateAdminOnboardingData';
import { ENTERPRISE_HELP_GROUPING } from '../../../settings/data/constants';

interface OrganizeLearnersFlowProps {
  enterpriseId: string;
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  handleBackTour: (backEventName: string) => void;
}

const OrganizeLearnersFlow = ({
  enterpriseId, handleAdvanceTour, handleEndTour, handleBackTour,
}: OrganizeLearnersFlowProps): Array<TourStep> => {
  const intl = useIntl();
  const { data: hydrateAdminOnboardingData } = useHydrateAdminOnboardingData(enterpriseId);
  const { hasEnterpriseMembers, hasEnterpriseGroups } = hydrateAdminOnboardingData as HydratedAdminOnboardingData;
  const onOrganizeAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME);
  const onOrganizeEnd = () => handleEndTour(
    ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME,
    configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ORGANIZE_LEARNERS_UUID,
  );
  const onOrganizeBack = () => handleBackTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_BACK_EVENT_NAME);

  const createGroupStepBody = (
    <FormattedMessage
      {...messages.organizeLearnersStepFiveBody}
      values={{
        a: (chunks) => (
          <Hyperlink
            destination={ENTERPRISE_HELP_GROUPING}
            target="_blank"
          >
            {chunks}
          </Hyperlink>
        ),
      }}
    />
  );

  const tourNoMembers: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneNoMembersBody),
    onEnd: onOrganizeEnd,
  }];

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
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: onOrganizeAdvance,
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepFourBody),
    onAdvance: onOrganizeAdvance,
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: createGroupStepBody,
    onEnd: onOrganizeEnd,
    onBack: onOrganizeBack,
  }];

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
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: onOrganizeAdvance,
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepFourBody),
    onAdvance: onOrganizeAdvance,
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepFiveBody),
    onAdvance: onOrganizeAdvance,
    onBack: onOrganizeBack,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUP_CARD}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersWithGroupsStepSixBody),
    onBack: onOrganizeBack,
    onEnd: onOrganizeEnd,
  }];

  if (!hasEnterpriseMembers) {
    return tourNoMembers;
  }
  if (hasEnterpriseGroups) {
    return tourWithGroups;
  }
  return tourNoGroups;
};

export default OrganizeLearnersFlow;

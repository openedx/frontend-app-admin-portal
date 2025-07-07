import { useIntl } from '@edx/frontend-platform/i18n';

import { ADMIN_TOUR_EVENT_NAMES, ORGANIZE_LEARNER_TARGETS } from '../constants';
import messages from '../messages';
import { configuration } from '../../../../config';
import { TourStep } from '../../types';

interface OrganizeLearnersFlowProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const OrganizeLearnersFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: OrganizeLearnersFlowProps): Array<TourStep> => {
  const intl = useIntl();
  const onOrganizeAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME);

  const tour: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepTwoBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepFourBody),
    onAdvance: onOrganizeAdvance,
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepFiveBody),
    onEnd: () => handleEndTour(
      ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME,
      configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ORGANIZE_LEARNERS_UUID,
    ),
  }];
  return tour;
};

export default OrganizeLearnersFlow;

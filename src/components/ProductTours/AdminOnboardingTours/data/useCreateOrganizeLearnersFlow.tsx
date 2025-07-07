import { useIntl } from '@edx/frontend-platform/i18n';

import { ADMIN_TOUR_EVENT_NAMES, ORGANIZE_LEARNER_TARGETS } from '../constants';
import messages from '../messages';
import { configuration } from '../../../../config';
import { TourStep } from '../../types';

interface CreateOrganizeLearnersFlowProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const useCreateOrganizeLearnersFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: CreateOrganizeLearnersFlowProps): Array<TourStep> => {
  const intl = useIntl();

  const tour: Array<TourStep> = [{
    target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
    body: intl.formatMessage(messages.organizeLearnersStepOneBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepTwoBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepThreeBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
    placement: 'top',
    body: intl.formatMessage(messages.organizeLearnersStepFourBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
    placement: 'left',
    body: intl.formatMessage(messages.organizeLearnersStepSixBody),
    onEnd: () => handleEndTour(
      ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME,
      configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ORGANIZE_LEARNERS_UUID,
    ),
  }];
  return tour;
};

export default useCreateOrganizeLearnersFlow;

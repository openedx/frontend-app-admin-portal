import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';
import { TourStep } from '../../types';
import { TOUR_TARGETS } from '../../constants';
import { ADMIN_TOUR_EVENT_NAMES } from '../constants';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const SetUpPreferencesFlow = ({
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  return [
    {
      title: intl.formatMessage(messages.viewSetUpPreferencesTitle),
      target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
      placement: 'right',
      body: intl.formatMessage(messages.viewSetUpPreferences),
      onEnd: () => handleEndTour(
        ADMIN_TOUR_EVENT_NAMES.SET_UP_PREFERENCES_COMPLETED_EVENT_NAME,
        configuration.ADMIN_ONBOARDING_UUIDS.FLOW_PREFERENCES_UUID,
      ),
    }];
};

export default SetUpPreferencesFlow;

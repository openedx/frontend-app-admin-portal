import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { TourStep } from '../types';
import { TOUR_TARGETS } from '../constants';

interface CreateTourFlowsProps {
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const SetUpPreferencesFlow = ({
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  return [
    {
      target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
      placement: 'right',
      body: intl.formatMessage(messages.viewSetUpPreferences),
      onAdvance: handleEndTour,
    }];
};

export default SetUpPreferencesFlow;

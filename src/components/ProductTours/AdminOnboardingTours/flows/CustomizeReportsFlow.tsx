import { useIntl } from '@edx/frontend-platform/i18n';
import { CUSTOMIZE_REPORTS_SIDEBAR, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const CustomizeReportsFlow = ({
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  return [
    {
      title: intl.formatMessage(messages.viewCustomizeReportsTitle),
      target: `#${CUSTOMIZE_REPORTS_SIDEBAR}`,
      placement: 'right',
      body: intl.formatMessage(messages.viewCustomizeReports),
      onEnd: () => handleEndTour(
        ADMIN_TOUR_EVENT_NAMES.CUSTOMIZE_REPORTS_COMPLETED_EVENT_NAME,
        configuration.ADMIN_ONBOARDING_UUIDS.FLOW_CUSTOMIZE_REPORTS_UUID,
      ),
    }];
};

export default CustomizeReportsFlow;

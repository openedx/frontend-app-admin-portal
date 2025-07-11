import { useIntl } from '@edx/frontend-platform/i18n';
import { CUSTOMIZE_REPORTS_SIDEBAR } from './constants';
import messages from './messages';
import { TourStep } from '../types';

interface CreateTourFlowsProps {
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const CustomizeReportsFlow = ({
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  return [
    {
      target: `#${CUSTOMIZE_REPORTS_SIDEBAR}`,
      placement: 'right',
      body: intl.formatMessage(messages.viewCustomizeReports),
      onAdvance: handleEndTour,
    }];
};

export default CustomizeReportsFlow;

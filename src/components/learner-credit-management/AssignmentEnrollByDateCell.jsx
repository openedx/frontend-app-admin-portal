import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip, Stack,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ENROLL_BY_DATE_DAYS_THRESHOLD, formatDate } from './data';
import { isTodayWithinDateThreshold } from '../../utils';

const ExpiringIconButtonWithToolTip = () => {
  const intl = useIntl();
  const internationalizedToolTipContent = intl.formatMessage({
    id: 'lcm.budget.detail.page.assignments.table.columns.enroll.by.date.data.tool.tip.content',
    defaultMessage: 'Enrollment deadline approaching',
    description: 'On hover tool tip message for an upcoming enrollment date',
  });
  return (
    <IconButtonWithTooltip
      variant="warning"
      tooltipContent={internationalizedToolTipContent}
      tooltipPlacement="left"
      src={Warning}
      iconAs={Icon}
      size="inline"
      data-testid="upcoming-allocation-expiration-tooltip"
    />
  );
};

const AssignmentEnrollByDateCell = ({ row }) => {
  const { original: { earliestPossibleExpiration: { date } } } = row;

  const formattedEnrollByDate = formatDate(date);
  const isDateWithinThreshold = isTodayWithinDateThreshold(
    {
      days: ENROLL_BY_DATE_DAYS_THRESHOLD,
      date,
    },
  );

  return (
    <Stack direction="horizontal" gap={1}>
      {isDateWithinThreshold && <ExpiringIconButtonWithToolTip />}
      <div className="align-content-center">
        {formattedEnrollByDate}
      </div>
    </Stack>
  );
};

AssignmentEnrollByDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      earliestPossibleExpiration: PropTypes.shape({
        date: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentEnrollByDateCell;

import PropTypes from 'prop-types';
import {
  Icon, IconButtonWithTooltip, Stack,
} from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { formatDate } from './data';
import { isTodayWithinDateThreshold } from '../../utils';

const ExpiringIconButtonWithToolTip = () => (
  <IconButtonWithTooltip
    variant="warning"
    invertColors
    isActive
    tooltipContent="Enrollment deadline approaching"
    tooltipPlacement="left"
    src={WarningFilled}
    iconAs={Icon}
    size="sm"
    className="bg-transparent"
  />
);

const AssignmentEnrollByDateCell = ({ row }) => {
  const { original: { earliestPossibleExpiration: { date } } } = row;

  const formattedEnrollByDate = formatDate(date);
  const isDateWithinThreshold = isTodayWithinDateThreshold(
    {
      days: 15,
      date,
    },
  );
  const className = classNames(
    'align-content-center',
    {
      'ml-4': !isDateWithinThreshold,
      'pl-3.5': !isDateWithinThreshold,
    },
  );

  return (
    <Stack direction="horizontal" gap={1}>
      {isDateWithinThreshold && <ExpiringIconButtonWithToolTip />}
      <div className={className}>
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

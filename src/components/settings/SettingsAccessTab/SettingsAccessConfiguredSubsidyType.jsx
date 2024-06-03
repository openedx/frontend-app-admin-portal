import React from 'react';
import { CheckCircle } from '@openedx/paragon/icons';
import {
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SUBSIDY_TYPE_LABELS } from '../data/constants';

const SettingsAccessConfiguredSubsidyType = ({
  subsidyType,
}) => (
  <>
    <p>
      <FormattedMessage
        id="adminPortal.settings.access.configuredSubsidyType.description"
        defaultMessage="Learners will browse and request courses from the associated catalog."
        description="Description of the configured subsidy type section."
      />
    </p>
    <div>
      <OverlayTrigger
        trigger={['hover', 'focus']}
        placement="right"
        overlay={(
          <Tooltip id="configured-subsidy-type-tooltip">
            <FormattedMessage
              id="adminPortal.settings.access.configuredSubsidyType.tooltip"
              defaultMessage="Contact support to change your selection"
              description="Tooltip message for the configured subsidy type."
            />
          </Tooltip>
          )}
      >
        <div className="d-inline">
          <CheckCircle className="text-success-500 mr-1" />
          <span><FormattedMessage {...SUBSIDY_TYPE_LABELS[subsidyType]} /></span>
        </div>
      </OverlayTrigger>
    </div>
  </>
);

SettingsAccessConfiguredSubsidyType.propTypes = {
  subsidyType: PropTypes.string.isRequired,
};

export default SettingsAccessConfiguredSubsidyType;

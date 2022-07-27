import React from 'react';
import { CheckCircle } from '@edx/paragon/icons';
import {
  OverlayTrigger,
  Tooltip,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { SUBSIDY_TYPE_LABELS } from '../data/constants';

function SettingsAccessConfiguredSubsidyType({
  subsidyType,
}) {
  return (
    <>
      <p>Learners will browse and request courses from the associated catalog.</p>
      <div>
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="right"
          overlay={(
            <Tooltip id="configured-subsidy-type-tooltip">
              Contact support to change your selection
            </Tooltip>
          )}
        >
          <div className="d-inline">
            <CheckCircle className="text-success-500 mr-1" />
            <span>{SUBSIDY_TYPE_LABELS[subsidyType]}</span>
          </div>
        </OverlayTrigger>
      </div>
    </>
  );
}

SettingsAccessConfiguredSubsidyType.propTypes = {
  subsidyType: PropTypes.string.isRequired,
};

export default SettingsAccessConfiguredSubsidyType;

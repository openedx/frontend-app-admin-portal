import React from 'react';
import PropTypes from 'prop-types';
import { Image } from '@edx/paragon';
import { connect } from 'react-redux';
import { channelMapping } from '../../../utils';

import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED_TYPE,
  DEGREED2_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from '../data/constants';
import BlackboardConfig from './LMSConfigs/BlackboardConfig';
import { CanvasFormConfig } from './LMSConfigs/Canvas/CanvasConfig.tsx';
import CornerstoneConfig from './LMSConfigs/CornerstoneConfig';
import DegreedConfig from './LMSConfigs/DegreedConfig';
import Degreed2Config from './LMSConfigs/Degreed2Config';
import MoodleConfig from './LMSConfigs/MoodleConfig';
import SAPConfig from './LMSConfigs/SAPConfig';
import FormContextWrapper from '../../forms/FormContextWrapper.tsx';

// TODO: Add remaining configs
const flowConfigs = {
  [CANVAS_TYPE]: CanvasFormConfig,
};

// TODO: Convert to TypeScript
const LMSConfigPage = ({
  LMSType,
  onClick,
  enterpriseCustomerUuid,
  existingConfigFormData,
  existingConfigs,
  setExistingConfigFormData,
}) => {
  const handleCloseWorkflow = (submitted, msg) => {
    onClick(submitted ? msg : '');
  };
  return (
    <span>
      <h3 className="mt-4.5 mb-3.5">
        <Image className="lms-icon" src={channelMapping[LMSType].icon} />
        <span className="ml-2">
          Connect {channelMapping[LMSType].displayName}
        </span>
      </h3>
      {/* TODO: Replace giant switch */}
      {LMSType === BLACKBOARD_TYPE && (
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
        setExistingConfigFormData={setExistingConfigFormData}
      />
      )}
      {LMSType === CANVAS_TYPE && (
      <FormContextWrapper
        formWorkflowConfig={flowConfigs[CANVAS_TYPE]({
          enterpriseCustomerUuid,
          onSubmit: setExistingConfigFormData,
          onClickCancel: handleCloseWorkflow,
          existingData: existingConfigFormData,
        })}
        onClickOut={handleCloseWorkflow}
        onSubmit={setExistingConfigFormData}
        formData={existingConfigFormData}
      />
      )}
      {LMSType === CORNERSTONE_TYPE && (
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
      />
      )}
      {LMSType === DEGREED2_TYPE && (
      <Degreed2Config
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
      />
      )}
      {LMSType === DEGREED_TYPE && (
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
      />
      )}
      {LMSType === MOODLE_TYPE && (
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
      />
      )}
      {LMSType === SAP_TYPE && (
      <SAPConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
      />
      )}
    </span>
  );
};
const mapStateToProps = (state) => ({
  enterpriseCustomerUuid: state.portalConfiguration.enterpriseId,
});

LMSConfigPage.defaultProps = {
  existingConfigs: [],
};

LMSConfigPage.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  LMSType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingConfigFormData: PropTypes.shape({}).isRequired,
  existingConfigs: PropTypes.arrayOf(PropTypes.string),
  setExistingConfigFormData: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(LMSConfigPage);

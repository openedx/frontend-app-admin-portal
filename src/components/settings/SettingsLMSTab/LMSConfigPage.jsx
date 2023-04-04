import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE, DEGREED2_TYPE, MOODLE_TYPE, SAP_TYPE,
} from '../data/constants';
import { BlackboardFormConfig } from './LMSConfigs/Blackboard/BlackboardConfig.tsx';
import { CanvasFormConfig } from './LMSConfigs/Canvas/CanvasConfig.tsx';
import { CornerstoneFormConfig } from './LMSConfigs/Cornerstone/CornerstoneConfig.tsx';
import { DegreedFormConfig } from './LMSConfigs/Degreed/DegreedConfig.tsx';
import { MoodleFormConfig } from './LMSConfigs/Moodle/MoodleConfig.tsx';
import { SAPFormConfig } from './LMSConfigs/SAP/SAPConfig.tsx';
import FormContextWrapper from '../../forms/FormContextWrapper.tsx';

const flowConfigs = {
  [BLACKBOARD_TYPE]: BlackboardFormConfig,
  [CANVAS_TYPE]: CanvasFormConfig,
  [CORNERSTONE_TYPE]: CornerstoneFormConfig,
  [DEGREED2_TYPE]: DegreedFormConfig,
  [MOODLE_TYPE]: MoodleFormConfig,
  [SAP_TYPE]: SAPFormConfig,
};

const LMSConfigPage = ({
  LMSType,
  onClick,
  enterpriseCustomerUuid,
  existingConfigFormData,
  existingConfigs,
  setExistingConfigFormData,
  isLmsStepperOpen,
  closeLmsStepper,
}) => {
  const handleCloseWorkflow = (submitted, msg) => {
    onClick(submitted ? msg : '');
    closeLmsStepper();
    return true;
  };
  return (
    <FormContextWrapper
      formWorkflowConfig={flowConfigs[LMSType]({
        enterpriseCustomerUuid,
        onSubmit: setExistingConfigFormData,
        onClickCancel: handleCloseWorkflow,
        existingData: existingConfigFormData,
        existingConfigNames: existingConfigs,
      })}
      onClickOut={handleCloseWorkflow}
      onSubmit={setExistingConfigFormData}
      formData={existingConfigFormData}
      isStepperOpen={isLmsStepperOpen}
    />
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
  isLmsStepperOpen: PropTypes.bool.isRequired,
  closeLmsStepper: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(LMSConfigPage);

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
import { BlackboardFormConfig } from './LMSConfigs/Blackboard/BlackboardConfig.tsx';
import { CanvasFormConfig } from './LMSConfigs/Canvas/CanvasConfig.tsx';
import { DegreedFormConfig } from './LMSConfigs/Degreed/DegreedConfig.tsx';
import CornerstoneConfig from './LMSConfigs/CornerstoneConfig';
import Degreed2Config from './LMSConfigs/Degreed2Config';
import MoodleConfig from './LMSConfigs/MoodleConfig';
import SAPConfig from './LMSConfigs/SAPConfig';
import FormContextWrapper from '../../forms/FormContextWrapper.tsx';

const flowConfigs = {
  [BLACKBOARD_TYPE]: BlackboardFormConfig,
  [CANVAS_TYPE]: CanvasFormConfig,
  [DEGREED_TYPE]: DegreedFormConfig,
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
  const [edited, setEdited] = React.useState(false);
  const handleCloseWorkflow = (submitted, msg) => {
    onClick(submitted ? msg : '');
    closeLmsStepper();
    return true;
  };
  return (
    <span>
      {LMSType === BLACKBOARD_TYPE && (
        <FormContextWrapper
          formWorkflowConfig={flowConfigs[BLACKBOARD_TYPE]({
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
      )}
      {LMSType === CANVAS_TYPE && (
        <FormContextWrapper
          formWorkflowConfig={flowConfigs[CANVAS_TYPE]({
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
      )}
      {LMSType === CORNERSTONE_TYPE && (
        <>
          <h3 className="mt-4.5 mb-3.5">
            <Image className="lms-icon" src={channelMapping[LMSType]?.icon} />
            <span className="ml-2">
              Connect {channelMapping[LMSType]?.displayName}
            </span>
          </h3>
          <CornerstoneConfig
            enterpriseCustomerUuid={enterpriseCustomerUuid}
            onClick={onClick}
            existingData={existingConfigFormData}
            existingConfigs={existingConfigs}
            edited={edited}
            setEdited={setEdited}
          />
        </>
      )}
      {LMSType === DEGREED2_TYPE && (
        <>
          <h3 className="mt-4.5 mb-3.5">
            <Image className="lms-icon" src={channelMapping[LMSType]?.icon} />
            <span className="ml-2">
              Connect {channelMapping[LMSType]?.displayName}
            </span>
          </h3>
          <Degreed2Config
            enterpriseCustomerUuid={enterpriseCustomerUuid}
            onClick={onClick}
            existingData={existingConfigFormData}
            existingConfigs={existingConfigs}
          />
        </>
      )}
      {LMSType === DEGREED_TYPE && (
        <FormContextWrapper
          formWorkflowConfig={flowConfigs[DEGREED_TYPE]({
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
      )}

      {/* {LMSType === DEGREED_TYPE && (
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
        existingConfigs={existingConfigs}
      />
    )} */}
      {LMSType === MOODLE_TYPE && (
        <>
          <h3 className="mt-4.5 mb-3.5">
            <Image className="lms-icon" src={channelMapping[LMSType]?.icon} />
            <span className="ml-2">
              Connect {channelMapping[LMSType]?.displayName}
            </span>
          </h3>
          <MoodleConfig
            enterpriseCustomerUuid={enterpriseCustomerUuid}
            onClick={onClick}
            existingData={existingConfigFormData}
            existingConfigs={existingConfigs}
          />
        </>
      )}
      {LMSType === SAP_TYPE && (
        <>
          <h3 className="mt-4.5 mb-3.5">
            <Image className="lms-icon" src={channelMapping[LMSType]?.icon} />
            <span className="ml-2">
              Connect {channelMapping[LMSType]?.displayName}
            </span>
          </h3>
          <SAPConfig
            enterpriseCustomerUuid={enterpriseCustomerUuid}
            onClick={onClick}
            existingData={existingConfigFormData}
            existingConfigs={existingConfigs}
          />
        </>
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
  isLmsStepperOpen: PropTypes.bool.isRequired,
  closeLmsStepper: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(LMSConfigPage);

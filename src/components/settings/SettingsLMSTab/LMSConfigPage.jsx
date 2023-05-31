import _ from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FormContextWrapper from '../../forms/FormContextWrapper.tsx';
import { getChannelMap } from '../../../utils';
import LMSFormWorkflowConfig from './LMSFormWorkflowConfig.tsx';

const LMSConfigPage = ({
  onClick,
  enterpriseCustomerUuid,
  existingConfigFormData,
  existingConfigs,
  setExistingConfigFormData,
  isLmsStepperOpen,
  closeLmsStepper,
  lmsType,
}) => {
  const channelMap = useMemo(() => getChannelMap(), []);
  const handleCloseWorkflow = (submitted, msg) => {
    onClick(submitted ? msg : '');
    closeLmsStepper();
    return true;
  };

  const formWorkflowConfig = LMSFormWorkflowConfig({
    enterpriseCustomerUuid,
    onSubmit: setExistingConfigFormData,
    handleCloseClick: handleCloseWorkflow,
    existingData: _.cloneDeep(existingConfigFormData),
    existingConfigNames: existingConfigs,
    channelMap,
    lmsType,
  });

  return (
    <div>
      <FormContextWrapper
        formWorkflowConfig={formWorkflowConfig}
        onClickOut={handleCloseWorkflow}
        onSubmit={setExistingConfigFormData}
        formData={existingConfigFormData}
        isStepperOpen={isLmsStepperOpen}
      />
    </div>
  );
};
const mapStateToProps = (state) => ({
  enterpriseCustomerUuid: state.portalConfiguration.enterpriseId,
});

LMSConfigPage.defaultProps = {
  existingConfigs: {},
  lmsType: '',
};

LMSConfigPage.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingConfigFormData: PropTypes.shape({}).isRequired,
  existingConfigs: PropTypes.shape({}),
  setExistingConfigFormData: PropTypes.func.isRequired,
  isLmsStepperOpen: PropTypes.bool.isRequired,
  closeLmsStepper: PropTypes.func.isRequired,
  lmsType: PropTypes.string,
};

export default connect(mapStateToProps)(LMSConfigPage);

import _ from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import FormContextWrapper from '../../forms/FormContextWrapper';
import { getChannelMap } from '../../../utils';
import { LMSFormWorkflowConfig } from './LMSFormWorkflowConfig';

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
  const intl = useIntl();

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
        workflowTitle={intl.formatMessage({
          id: 'adminPortal.settings.learningPlatformTab.newIntegrationTitle',
          defaultMessage: 'New learning platform integration',
          description: 'Title for new learning platform integration workflow',
        })}
        formWorkflowConfig={formWorkflowConfig}
        onClickOut={handleCloseWorkflow}
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

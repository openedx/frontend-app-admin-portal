import React, {
  useState, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormContextWrapper from '../../forms/FormContextWrapper';
import { SSOConfigContext } from './SSOConfigContext';
import SSOFormWorkflowConfig from './SSOFormWorkflowConfig';
import SsoErrorPage from './SsoErrorPage';
import { camelCaseDict } from '../../../utils';
import UnsavedSSOChangesModal from './UnsavedSSOChangesModal';
import { IDP_URL_SELECTION, IDP_XML_SELECTION } from './steps/NewSSOConfigConnectStep';

const NewSSOStepper = ({ enterpriseId, isStepperOpen, setIsStepperOpen }) => {
  const {
    setProviderConfig, setRefreshBool, ssoState: { providerConfig, refreshBool },
  } = useContext(SSOConfigContext);
  const providerConfigCamelCase = camelCaseDict(providerConfig || {});
  const [configureError, setConfigureError] = useState(null);
  const intl = useIntl();

  const handleCloseWorkflow = () => {
    setProviderConfig?.(null);
    setIsStepperOpen(false);
    setRefreshBool(!refreshBool);
  };
  if (providerConfigCamelCase.metadataXml || providerConfigCamelCase.metadataUrl) {
    providerConfigCamelCase.idpConnectOption = providerConfigCamelCase?.metadataUrl
      ? IDP_URL_SELECTION
      : IDP_XML_SELECTION;
  }

  return (
    <>
      {isStepperOpen && !configureError && (
        <div>
          <FormContextWrapper
            workflowTitle={intl.formatMessage({
              id: 'adminPortal.settings.ssoConfigForm.newSsoIntegration',
              defaultMessage: 'New SSO integration',
              description: 'Title for the new SSO integration form',
            })}
            formWorkflowConfig={SSOFormWorkflowConfig({ enterpriseId, setConfigureError, intl })}
            onClickOut={handleCloseWorkflow}
            formData={providerConfigCamelCase}
            isStepperOpen={isStepperOpen}
            UnsavedChangesModal={UnsavedSSOChangesModal}
          />
        </div>
      )}
      {isStepperOpen && configureError && (
        <SsoErrorPage isOpen={configureError !== null} stepperError />
      )}
    </>
  );
};

NewSSOStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  isStepperOpen: PropTypes.bool.isRequired,
  setIsStepperOpen: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewSSOStepper);

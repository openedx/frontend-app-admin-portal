import {
  Button, Container, Stepper,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { ArrowBack, ArrowForward } from '@edx/paragon/icons';
import isEmpty from 'validator/lib/isEmpty';
import isURL from 'validator/lib/isURL';
import React, {
  useContext, useMemo, useState,
} from 'react';
import { connect } from 'react-redux';
import { updateCurrentStep } from './data/actions';
import { useExistingProviderData, useIdpState } from './hooks';
import { SSOConfigContext } from './SSOConfigContext';
import SSOConfigConfigureStep from './steps/SSOConfigConfigureStep';
import SSOConfigIDPStep from './steps/SSOConfigIDPStep';
import SSOConfigServiceProviderStep from './steps/SSOConfigServiceProviderStep';
import SSOConfigConnectStep from './steps/SSOConfigConnectStep';
import handleErrors from '../utils';
import LmsApiService from '../../../data/services/LmsApiService';

function SSOStepper({ enterpriseSlug, enterpriseId, enterpriseName }) {
  const {
    ssoState,
    dispatchSsoState,
    setProviderConfig,
    setRefreshBool,
  } = useContext(SSOConfigContext);
  const { currentStep, providerConfig, refreshBool } = ssoState;
  const setCurrentStep = step => dispatchSsoState(updateCurrentStep(step));
  const [configValues, setConfigValues] = useState(null);
  const [connectError, setConnectError] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [formUpdated, setFormUpdated] = useState(false);
  const [existingProviderData] = useExistingProviderData(enterpriseId, refreshBool);
  const [showValidatedText, setShowValidatedText] = useState(false);
  const [idpNextButtonDisabled, setIdpNextButtonDisabled] = useState(false);
  const [configNextButtonDisabled, setConfigNextButtonDisabled] = useState(false);
  const [isUsingSap, setIsUsingSap] = React.useState(false);

  const {
    metadataURL,
    entityID,
    createOrUpdateIdpRecord,
  } = useIdpState();

  const isIdpStepComplete = useMemo(() => (
    (metadataURL && isURL(metadataURL)) && (entityID && !isEmpty(entityID))
  ), [metadataURL, entityID]);

  const handleCancel = () => {
    setCurrentStep('idp');
    setProviderConfig(null);
    setRefreshBool(!refreshBool);
  };

  async function sendData(type) {
    const configFormData = new FormData();
    const newConfigValues = { ...configValues };
    configFormData.append('enterprise_customer_uuid', enterpriseId);
    configFormData.append('enabled', true);
    Object.keys(configValues).forEach(key => configFormData.append(key, configValues[key]));
    // Depending on whether the user is using SAP or not as an identity provider, we need to update
    // both the update payload, as well as the config values.
    if (isUsingSap) {
      configFormData.append('identity_provider_type', 'sap_success_factors');
      configFormData.set('max_session_length', '');
      delete newConfigValues.max_session_length;
      configFormData.set('attr_user_permanent_id', 'loggedinuserid');
      delete newConfigValues.attr_user_permanent_id;
      configFormData.set('attr_full_name', '');
      delete newConfigValues.attr_full_name;
      configFormData.set('attr_first_name', '');
      delete newConfigValues.attr_first_name;
      configFormData.set('attr_last_name', '');
      delete newConfigValues.attr_last_name;
      configFormData.set('attr_email', 'NameID');
      delete newConfigValues.attr_email;
      configFormData.set('attr_username', 'loggedinuserid');
      delete newConfigValues.attr_username;
    } else {
      configFormData.append('identity_provider_type', 'standard_saml_provider');
      configFormData.set('other_settings', '');
      delete newConfigValues.other_settings;
    }
    setConfigValues(newConfigValues);
    try {
      await LmsApiService.updateProviderConfig(configFormData, providerConfig.id).then((response) => {
        if (type === 'update') {
          setProviderConfig(response.data);
        }
      });
    } catch (error) {
      setConnectError(true);
      return handleErrors(error);
    }
    return null;
  }

  const saveOnQuit = async () => {
    await sendData('save').then((err) => {
      if (!err) { handleCancel(); }
    });
    return null;
  };

  const updateConfig = async () => {
    if (configValues !== null) {
      await sendData('update').then((err) => {
        if (!err) { setCurrentStep('connect'); }
      });
    } else {
      setCurrentStep('connect');
    }
  };

  const { serviceprovider: { isSPConfigured } } = ssoState;

  return (
    <div className="sso-stepper">
      <Stepper activeKey={currentStep}>
        <Stepper.Header />

        <Container size="lg" className="py-3">
          <Stepper.Step eventKey="idp" title="Identity Provider">
            <SSOConfigIDPStep />
          </Stepper.Step>

          <Stepper.Step eventKey="serviceprovider" title="Service Provider">
            <SSOConfigServiceProviderStep />
          </Stepper.Step>

          <Stepper.Step eventKey="configure" title="Configure">
            <SSOConfigConfigureStep
              setConfigValues={setConfigValues}
              connectError={connectError}
              saveOnQuit={saveOnQuit}
              setProviderConfig={setProviderConfig}
              showExitModal={showExitModal}
              closeExitModal={() => { setShowExitModal(false); }}
              existingConfigData={providerConfig}
              refreshBool={refreshBool}
              setRefreshBool={setRefreshBool}
              setFormUpdated={setFormUpdated}
              setConfigNextButtonDisabled={setConfigNextButtonDisabled}
              isUsingSap={isUsingSap}
              setIsUsingSap={setIsUsingSap}
            />
          </Stepper.Step>

          <Stepper.Step eventKey="connect" title="Connect">
            <SSOConfigConnectStep
              setConnectError={setConnectError}
              showValidatedText={showValidatedText}
              setShowValidatedText={setShowValidatedText}
            />
          </Stepper.Step>
        </Container>

        <div className="py-3">
          <Stepper.ActionRow eventKey="idp">
            { providerConfig != null && (
              <Button onClick={() => handleCancel()}>
                Cancel
              </Button>
            )}
            <Stepper.ActionRow.Spacer />
            <Button
              disabled={!isIdpStepComplete || idpNextButtonDisabled}
              onClick={() => {
                setIdpNextButtonDisabled(true);
                createOrUpdateIdpRecord({
                  enterpriseName,
                  enterpriseSlug,
                  enterpriseId,
                  providerConfig,
                  existingProviderData,
                  onSuccess: () => {
                    setCurrentStep('serviceprovider');
                    setIdpNextButtonDisabled(false);
                  },
                });
              }}
            >
              Next<ArrowForward className="ml-2" />
            </Button>
          </Stepper.ActionRow>

          <Stepper.ActionRow eventKey="serviceprovider">
            <Button variant="outline-primary" onClick={() => setCurrentStep('idp')}>
              <ArrowBack />
            </Button>
            <Button onClick={() => { handleCancel(); }}>
              Cancel
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button disabled={!isSPConfigured} onClick={() => setCurrentStep('configure')}>
              Next
              <ArrowForward className="ml-2" />
            </Button>
          </Stepper.ActionRow>

          <Stepper.ActionRow eventKey="configure">
            <Button variant="outline-primary" onClick={() => setCurrentStep('serviceprovider')}>
              <ArrowBack />
            </Button>
            <Button
              onClick={() => {
                if (formUpdated) {
                  setShowExitModal(true);
                } else {
                  handleCancel();
                }
              }}
            >
              Cancel
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button disabled={configNextButtonDisabled} onClick={() => updateConfig()}>
              Next
              <ArrowForward className="ml-2" />
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="connect">
            <Button variant="outline-primary" onClick={() => setCurrentStep('configure')}>
              <ArrowBack />
            </Button>
            <Button onClick={() => { handleCancel(); }}>
              Cancel
            </Button>
            <Stepper.ActionRow.Spacer />
            {showValidatedText && (
              <Button onClick={() => { handleCancel(); }}>
                Submit
              </Button>
            )}
          </Stepper.ActionRow>
        </div>
      </Stepper>
    </div>
  );
}

SSOStepper.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseName: state.portalConfiguration.enterpriseName,
});

export default connect(mapStateToProps)(SSOStepper);

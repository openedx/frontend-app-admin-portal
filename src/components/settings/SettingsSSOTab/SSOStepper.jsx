import {
  Button, Container, Stepper,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { ArrowBack, ArrowForward } from '@edx/paragon/icons';
import isEmpty from 'validator/lib/isEmpty';
import isURL from 'validator/lib/isURL';
import React, { useContext, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { updateCurrentStep } from './data/actions';
import { useIdpState } from './hooks';
import { SSOConfigContext } from './SSOConfigContext';
import SSOConfigConfigureStep from './steps/SSOConfigConfigureStep';
import SSOConfigIDPStep from './steps/SSOConfigIDPStep';
import SSOConfigServiceProviderStep from './steps/SSOConfigServiceProviderStep';
import SSOConfigConnectStep from './steps/SSOConfigConnectStep';
import handleErrors from '../utils';
import LmsApiService from '../../../data/services/LmsApiService';

const SSOStepper = ({ enterpriseSlug, enterpriseId, enterpriseName }) => {
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
  const [existingIdpDataEntityId, setExistingIdpDataEntityId] = useState(null);
  const [existingIdpDataId, setExistingIdpDataId] = useState(null);
  const [existingMetadataUrl, setExistingMetadataUrl] = useState(null);

  const {
    entryType,
    metadataURL,
    entityID,
    publicKey,
    ssoUrl,
    createOrUpdateIdpRecord,
  } = useIdpState();

  const isIdpStepComplete = useMemo(() => {
    if (entryType === 'url') {
      return (metadataURL && isURL(metadataURL)) && (entityID && !isEmpty(entityID));
    }
    if (entryType === 'direct') {
      return (
        (publicKey && !isEmpty(publicKey))
        && (entityID && !isEmpty(entityID))
        && (ssoUrl && isURL(ssoUrl))
      );
    }
    return false;
  }, [metadataURL, entityID, publicKey, ssoUrl, entryType]);

  const handleCancel = () => {
    setCurrentStep('idp');
    setProviderConfig(null);
    setRefreshBool(!refreshBool);
  };

  const saveOnQuit = async () => {
    let err;
    if (configValues !== null) {
      configValues.append('enterprise_customer_uuid', enterpriseId);
      try {
        await LmsApiService.updateProviderConfig(configValues, providerConfig.id);
      } catch (error) {
        err = handleErrors(error);
        setConnectError(true);
      }
    }
    if (!err) {
      handleCancel();
    }
  };

  const updateConfig = async () => {
    let err;
    if (configValues !== null) {
      configValues.append('enterprise_customer_uuid', enterpriseId);
      try {
        const response = await LmsApiService.updateProviderConfig(configValues, providerConfig.id);
        setProviderConfig(response.data);
      } catch (error) {
        err = handleErrors(error);
        setConnectError(true);
      }
    }
    if (!err) {
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
            <SSOConfigIDPStep
              setExistingIdpDataEntityId={setExistingIdpDataEntityId}
              setExistingIdpDataId={setExistingIdpDataId}
              setExistingMetadataUrl={setExistingMetadataUrl}
            />
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
            />
          </Stepper.Step>

          <Stepper.Step eventKey="connect" title="Connect">
            <SSOConfigConnectStep setConnectError={setConnectError} />
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
              disabled={!isIdpStepComplete}
              onClick={() => {
                createOrUpdateIdpRecord({
                  enterpriseName,
                  enterpriseSlug,
                  enterpriseId,
                  providerConfig,
                  existingIdpDataEntityId,
                  existingIdpDataId,
                  existingMetadataUrl,
                  onSuccess: () => setCurrentStep('serviceprovider'),
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
            <Button onClick={() => updateConfig()}>Next<ArrowForward className="ml-2" /></Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="connect">
            <Button variant="outline-primary" onClick={() => setCurrentStep('configure')}>
              <ArrowBack />
            </Button>
            <Button onClick={() => { handleCancel(); }}>
              Cancel
            </Button>
            <Stepper.ActionRow.Spacer />
          </Stepper.ActionRow>
        </div>
      </Stepper>
    </div>
  );
};

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

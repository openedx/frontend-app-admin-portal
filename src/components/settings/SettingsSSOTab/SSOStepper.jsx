import {
  Button, Container, Stepper,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { ArrowBack, ArrowForward } from '@edx/paragon/icons';
import isEmpty from 'validator/lib/isEmpty';
import isURL from 'validator/lib/isURL';
import { useContext, useMemo, useState } from 'react';
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
  const { ssoState, dispatchSsoState } = useContext(SSOConfigContext);
  const { currentStep, providerConfig } = ssoState;
  const setCurrentStep = step => dispatchSsoState(updateCurrentStep(step));
  const [configValues, setConfigValues] = useState(null);
  const [connectError, setConnectError] = useState(false);

  const { metadataURL, entityID, createOrUpdateIdpRecord } = useIdpState();

  const isIdpStepComplete = useMemo(
    () => (metadataURL && isURL(metadataURL)) && (entityID && !isEmpty(entityID)),
    [metadataURL, entityID],
  );

  const updateConfig = async () => {
    if (configValues !== null) {
      configValues.append('enterprise_customer_uuid', enterpriseId);
      let err;
      try {
        await LmsApiService.updateProviderConfig(configValues, providerConfig.id);
      } catch (error) {
        err = handleErrors(error);
      }
      if (err) {
        // TODO - what do we want to do on error??
      }
    }
    setCurrentStep('connect');
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
            <SSOConfigConfigureStep setConfigValues={setConfigValues} connectError={connectError} />
          </Stepper.Step>

          <Stepper.Step eventKey="connect" title="Connect">
            <SSOConfigConnectStep setConnectError={setConnectError} />
          </Stepper.Step>
        </Container>

        <div className="py-3">
          <Stepper.ActionRow eventKey="idp">
            <Stepper.ActionRow.Spacer />
            <Button
              disabled={!isIdpStepComplete}
              onClick={() => {
                createOrUpdateIdpRecord({
                  enterpriseName,
                  enterpriseSlug,
                  enterpriseId,
                  providerConfig,
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
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => updateConfig()}>Next<ArrowForward className="ml-2" /></Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="connect">
            <Button variant="outline-primary" onClick={() => setCurrentStep('configure')}>
              <ArrowBack />
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

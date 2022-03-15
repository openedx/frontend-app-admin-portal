import {
  Button, Container, Stepper,
} from '@edx/paragon';
import { ArrowBack, ArrowForward } from '@edx/paragon/icons';
import { useContext } from 'react';
import { updateIdpCurrentstep } from './data/actions';
import { SSOConfigContext } from './SSOConfigContext';
import SSOConfigConfigureStep from './steps/SSOConfigConfigureStep';
import SSOConfigIDPStep from './steps/SSOConfigIDPStep';
import SSOConfigServiceProviderStep from './steps/SSOConfigServiceProviderStep';
import SSOConfigConnectStep from './steps/SSOConfigureConnectStep';

const SSOStepper = () => {
  const { ssoState: { currentStep }, dispatchSsoState } = useContext(SSOConfigContext);
  const setCurrentStep = val => { dispatchSsoState(updateIdpCurrentstep(val)); };

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
            <SSOConfigConfigureStep />
          </Stepper.Step>

          <Stepper.Step eventKey="connect" title="Connect">
            <SSOConfigConnectStep />
          </Stepper.Step>
        </Container>

        <div className="py-3">
          <Stepper.ActionRow eventKey="idp">
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep('serviceprovider')}>Next<ArrowForward className="ml-2" /></Button>
          </Stepper.ActionRow>

          <Stepper.ActionRow eventKey="serviceprovider">
            <Button variant="outline-primary" onClick={() => setCurrentStep('idp')}>
              <ArrowBack />
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep('configure')}>Next<ArrowForward className="ml-2" /></Button>
          </Stepper.ActionRow>

          <Stepper.ActionRow eventKey="configure">
            <Button variant="outline-primary" onClick={() => setCurrentStep('serviceprovider')}>
              <ArrowBack />
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep('connect')}>Next<ArrowForward className="ml-2" /></Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="connect">
            <Button variant="outline-primary" onClick={() => setCurrentStep('configure')}>
              <ArrowBack />
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => alert('connected!')}>Connect</Button>
          </Stepper.ActionRow>
        </div>
      </Stepper>
    </div>
  );
};

export default SSOStepper;

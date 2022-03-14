import {
  Button, Container, Form, Stepper,
} from '@edx/paragon';
import { useState } from 'react';

const SSOStepper = () => {
  const steps = ['idp', 'serviceprovider', 'configure', 'connect'];
  const [currentStep, setCurrentStep] = useState(steps[0]);

  const [metadataMethod, setMetadataMethod] = useState('url'); // vs 'fileupload' in future
  const [metadataURL, setMetadataURL] = useState('');
  const handleMetadataUpdate = (event) => setMetadataMethod(event.target.value);
  const handleMetadataURLChange = (event) => setMetadataURL(event.target.value);
  const TITLE = 'First, select the way to provide your Identity Provider Metadata and fill out the corresponding fields. ';

  return (
    <div className="sso-stepper">
      <Stepper activeKey={currentStep}>
        <Stepper.Header />

        <Container size="lg" className="py-5">
          <Stepper.Step eventKey="idp" title="idp">
            <span>{TITLE}</span>
            <div className="mt-4">
              <Form.Group>
                <Form.RadioSet
                  name="metadataFetchMethod"
                  onChange={handleMetadataUpdate}
                  value={metadataMethod}
                >
                  <Form.Radio className="mb-3" value="url" placeholder="">Provide URL</Form.Radio>
                  <Form.Control
                    className="sso-create-form-control mb-4"
                    type="text"
                    onChange={handleMetadataURLChange}
                    floatingLabel="Identity Provider Metadata URL"
                    defaultValue={metadataURL}
                  />
                </Form.RadioSet>
              </Form.Group>
            </div>
          </Stepper.Step>

          <Stepper.Step eventKey="serviceprovider" title="Service Provider">
            Configure a Service provider
          </Stepper.Step>

          <Stepper.Step eventKey="configure" title="Configure">
            <h2>Configure</h2>
          </Stepper.Step>

          <Stepper.Step eventKey="connect" title="Connect">
            <h2>Connect</h2>
          </Stepper.Step>
        </Container>

        <div className="py-3">
          <Stepper.ActionRow eventKey="idp">
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep('serviceprovider')}>Next</Button>
          </Stepper.ActionRow>

          <Stepper.ActionRow eventKey="serviceprovider">
            <Button variant="outline-primary" onClick={() => setCurrentStep('idp')}>
              Previous
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep('configure')}>Next</Button>
          </Stepper.ActionRow>

          <Stepper.ActionRow eventKey="configure">
            <Button variant="outline-primary" onClick={() => setCurrentStep('serviceprovider')}>
              Previous
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep('connect')}>Next</Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="connect">
            <Button variant="outline-primary" onClick={() => setCurrentStep('configure')}>
              Previous
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

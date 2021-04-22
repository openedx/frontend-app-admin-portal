import React, { useState } from 'react';
import { FullscreenModal, Stepper, Button, Container } from '@edx/paragon';
import { AddLearnersStep } from './AddLearnersStep';

const BulkEnrollmentStepper = ({ isOpen, close, subscriptionUUID }) => {
  const steps = ['addLearners', 'review'];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  console.log('CUTTENT STEP', currentStep)

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="Learner enrollment"
          className="bg-light-200"
          isOpen={isOpen}
          onClose={close}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey="addLearners">
                <Button variant="outline-primary" onClick={close}>
                  Cancel
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => setCurrentStep('review')}>Next</Button>
              </Stepper.ActionRow>

              <Stepper.ActionRow eventKey="review">
                <Button variant="outline-primary" onClick={() => setCurrentStep('add-learners')}>
                  Previous
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button onClick={close}>Apply</Button>
              </Stepper.ActionRow>
            </>
          )}
        >
          <Container size="md">
            <Stepper.Step eventKey="addLearners" title="Add learners">
              <AddLearnersStep subscriptionUUID={subscriptionUUID} />
            </Stepper.Step>

            <Stepper.Step eventKey="review" title="Review">
              <h2>Review your work</h2>
            </Stepper.Step>
          </Container>
        </FullscreenModal>
      </Stepper>
    </>
  );
};

export default BulkEnrollmentStepper;

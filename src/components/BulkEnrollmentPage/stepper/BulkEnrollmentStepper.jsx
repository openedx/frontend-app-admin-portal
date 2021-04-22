import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FullscreenModal, Stepper, Button, Container,
} from '@edx/paragon';
import AddLearnersStep from './AddLearnersStep';
import ReviewStep from './ReviewStep';

const BulkEnrollmentStepper = ({ isOpen, close, subscriptionUUID }) => {
  const steps = ['addLearners', 'review'];
  const [currentStep, setCurrentStep] = useState(steps[0]);

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
                <Button variant="outline-primary" onClick={() => setCurrentStep('addLearners')}>
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
              <ReviewStep />
            </Stepper.Step>
          </Container>
        </FullscreenModal>
      </Stepper>
    </>
  );
};

BulkEnrollmentStepper.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  subscriptionUUID: PropTypes.string.isRequired,
};

export default BulkEnrollmentStepper;

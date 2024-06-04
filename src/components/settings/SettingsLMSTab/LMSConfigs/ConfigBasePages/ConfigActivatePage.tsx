import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Container, Form, Image } from '@openedx/paragon';
import { BLACKBOARD_TYPE, CANVAS_TYPE } from '../../../data/constants';
import { channelMapping } from '../../../../../utils';

const ConfigActivatePage = (lmsType: string) => {
  let verb = 'enabled';
  if (lmsType === CANVAS_TYPE || lmsType === BLACKBOARD_TYPE) {
    verb = 'authorized';
  }
  const lmsName = channelMapping[lmsType].displayName;
  return (
    <Container size="md">
      <Form style={{ maxWidth: '60rem' }}>
        <span className="d-flex pb-4">
          <Image
            className="lms-icon mr-2"
            src={channelMapping[lmsType].icon}
          />
          <h3>
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.activatePage.title"
              defaultMessage="Activate your {lmsName} integration"
              description="Title for the Activate Page."
              values={{ lmsName }}
            />
          </h3>
        </span>
        <p>
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.activatePage.successMessage"
            defaultMessage="Your {lmsName} integration has been successfully {verb} and is ready to activate!"
            description="Success message for the Activate Page."
            values={{ lmsName, verb }}
          />
        </p>
        <p>
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.activatePage.activationInstructions"
            defaultMessage="Once activated, edX For Business will begin syncing content metadata and learner activity with {lmsName}."
            description="Activation instructions for the Activate Page."
            values={{ lmsName }}
          />
        </p>
      </Form>
    </Container>
  );
};

export default ConfigActivatePage;

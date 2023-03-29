import React from 'react';

import { Form } from '@edx/paragon';
import { BLACKBOARD_TYPE, CANVAS_TYPE } from '../../../data/constants';
import { channelMapping } from '../../../../../utils';

const ConfigActivatePage = (lmsType: string) => {
  let verb = 'enabled';
  if (lmsType == CANVAS_TYPE || lmsType == BLACKBOARD_TYPE) {
    verb = 'authorized'
  }
  const lmsName = channelMapping[lmsType].displayName;
  return (
    <span>
      <Form style={{ maxWidth: '60rem' }}>
        <h2>Activate your {lmsName} integration</h2>

        <p>
          Your {lmsName} integration has been successfully {verb} and is ready to
          activate!
        </p>

        <p>
          Once activated, edX For Business will begin syncing content metadata and
          learner activity with {lmsName}.
        </p>
      </Form>
    </span>
  )
};

export default ConfigActivatePage;

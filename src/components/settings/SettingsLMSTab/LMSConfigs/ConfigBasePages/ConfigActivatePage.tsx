import React from 'react';

import { Container, Form, Image } from '@edx/paragon';
import { BLACKBOARD_TYPE, CANVAS_TYPE } from '../../../data/constants';
import { channelMapping } from '../../../../../utils';

const ConfigActivatePage = (lmsType: string) => {
  let verb = 'enabled';
  if (lmsType == CANVAS_TYPE || lmsType == BLACKBOARD_TYPE) {
    verb = 'authorized'
  }
  const lmsName = channelMapping[lmsType].displayName;
  return (
    <Container size='md'>
      <Form style={{ maxWidth: '60rem' }}>  
        <span className='d-flex pb-4'>
          <Image
            className="lms-icon mr-2"
            src={channelMapping[lmsType].icon}
          />
          <h3>
            Activate your {lmsName} integration
          </h3>
        </span>
        <p>
          Your {lmsName} integration has been successfully {verb} and is ready to
          activate!
        </p>

        <p>
          Once activated, edX For Business will begin syncing content metadata and
          learner activity with {lmsName}.
        </p>
      </Form>
    </Container>
  )
};

export default ConfigActivatePage;

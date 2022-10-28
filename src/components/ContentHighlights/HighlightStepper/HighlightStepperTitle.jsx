import React from 'react';
import { CheckCircle } from '@edx/paragon/icons';
import {
  Stack, Col, Icon, Form,
} from '@edx/paragon';

const HighlightStepperTitle = () => (
  <Stack>
    <Col>
      <Stack className="mb-3" direction="horizontal">
        <Icon src={CheckCircle} />
        <Col>
          <h3 className="m-0">Create a title for the highlight collection</h3>
        </Col>
      </Stack>
      <div className="mb-5">
        <p>
          Create a unique title for your highlight collection. This title will
          appear in your learner&apos;s portal together with the selected courses.
        </p>
        <p>
          <strong>
            Pro tip: We recommend naming your highlight collection to reflect skills
            it aims to develop, or to draw the attention of specific groups it targets.
            For example, &quot;Recommended for Marketing&quot; or &quot;Develop Leadership Skills&quot;
          </strong>
        </p>
      </div>
      <Form.Control type="text" defaultValue="Highlight collection name" />
    </Col>
  </Stack>
);

export default HighlightStepperTitle;

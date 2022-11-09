import React, { useContext } from 'react';
import {
  Stack, Col, Form, Icon, Container,
} from '@edx/paragon';
import { AddCircle } from '@edx/paragon/icons';
import { STEPPER_STEP_TEXT } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const HighlightStepperTitle = () => {
  const { stepperData, setStepperData } = useContext(ContentHighlightsContext);
  const handleChange = (e) => setStepperData({ title: e.target.value });
  return (
    <Container size="md">
      <Stack>
        <Col>
          <Stack className="mb-3" direction="horizontal">
            <Icon src={AddCircle} />
            <Col>
              <h3 className="m-0">{STEPPER_STEP_TEXT.createTitle}</h3>
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
          <Form.Group>
            <Form.Control value={stepperData?.title} onChange={handleChange} type="text" floatingLabel="Highlight collection name" />
          </Form.Group>
        </Col>
      </Stack>
    </Container>
  );
};

export default HighlightStepperTitle;

import React from 'react';
import {
  Row, Col, Icon, Container,
} from '@edx/paragon';
import { EditCircle } from '@edx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import HighlightStepperTitleInput from './HighlightStepperTitleInput';

const HighlightStepperTitle = () => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <h3 className="mb-3 d-flex align-items-center">
          <Icon src={EditCircle} className="mr-2 text-brand" />
          <FormattedMessage
            id="highlights.new.highlights.stepper.stepper.step.header.text.create.title"
            defaultMessage="Create a title for your highlight"
            description="Create title header message shown to administrators during creation of new content highlights"
          />
        </h3>
        <div className="mb-4.5">
          <p>
            <FormattedMessage
              id="highlights.new.highlights.stepper.stepper.step.sub.text.create.title"
              defaultMessage="Create a unique title for your highlight. This title is visible
              to your learners and helps them navigate to relevant content."
              description="Create title sub message shown to administrators during creation of new content highlights"
            />
          </p>
          <p>
            <strong>
              <FormattedMessage
                id="highlights.new.highlights.stepper.stepper.step.pro.tip.text.create.title"
                defaultMessage="Pro tip: we recommend naming your highlight collection to reflect skills
                it aims to develop, or to draw the attention of specific groups it targets.
                For example, {doubleQoute}Recommended for Marketing{doubleQoute}
                 or {doubleQoute}Develop Leadership Skills{doubleQoute}."
                description="Create title pro tip message shown to administrators during creation of new content highlights"
                values={{
                  doubleQoute: '"',
                }}
              />
            </strong>
          </p>
        </div>
        <HighlightStepperTitleInput />
      </Col>
    </Row>
  </Container>
);

export default HighlightStepperTitle;

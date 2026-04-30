import React from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import {
  Container,
  Row,
  Col,
  Icon,
} from '@openedx/paragon';
import { Assignment } from '@openedx/paragon/icons';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { SelectedContent } from './HighlightStepperConfirmContent';
import { STEPPER_STEP_TEXT } from '../data/constants';

const EditHighlightStepperConfirmContent = ({ enterpriseId }) => {
  const highlightTitle = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.highlightTitle,
  );

  return (
    <Container>
      <Row>
        <Col xs={12} md={8} lg={6}>
          <h3 className="mb-3 d-flex align-items-center">
            <Icon src={Assignment} className="mr-2 text-brand" />
            {STEPPER_STEP_TEXT.HEADER_TEXT.editConfirmContent}
          </h3>
          <p>
            {STEPPER_STEP_TEXT.SUB_TEXT.editConfirmContent(highlightTitle)}
          </p>
        </Col>
      </Row>
      <SelectedContent enterpriseId={enterpriseId} />
    </Container>
  );
};

EditHighlightStepperConfirmContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default EditHighlightStepperConfirmContent;

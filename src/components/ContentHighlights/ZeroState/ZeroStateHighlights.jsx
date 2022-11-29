import React from 'react';
import { useContextSelector } from 'use-context-selector';
import {
  Card, Button, Col, Row,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Add } from '@edx/paragon/icons';
import cardImage from '../data/images/ContentHighlightImage.svg';
import ZeroStateCardImage from './ZeroStateCardImage';
import ZeroStateCardText from './ZeroStateCardText';
import ZeroStateCardFooter from './ZeroStateCardFooter';
import ContentHighlightStepper from '../HighlightStepper/ContentHighlightStepper';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useContentHighlightsContext } from '../data/hooks';

const ZeroStateHighlights = ({ cardClassName }) => {
  const { openStepperModal } = useContentHighlightsContext();
  const isStepperModalOpen = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isOpen);

  return (
    <Row>
      <Col xs={12} sm={10} md={9} lg={8} xl={5}>
        <Card className={cardClassName}>
          <ZeroStateCardImage imageContainerClassName="bg-light-400 p-4" cardImage={cardImage} />
          <ZeroStateCardText textContainerClassName="text-center align-self-center">
            <h2 className="h3 mb-3">You haven&apos;t created any highlights yet.</h2>
            <p>
              Create and recommend content collections to your learners,
              enabling them to quickly locate content relevant to them.
            </p>
          </ZeroStateCardText>
          <ZeroStateCardFooter>
            <Button
              onClick={openStepperModal}
              iconBefore={Add}
              block
            >
              New highlight
            </Button>
          </ZeroStateCardFooter>
        </Card>
      </Col>
      <ContentHighlightStepper isModalOpen={isStepperModalOpen} />
    </Row>
  );
};

ZeroStateHighlights.propTypes = {
  cardClassName: PropTypes.string,
};

ZeroStateHighlights.defaultProps = {
  cardClassName: undefined,
};

export default ZeroStateHighlights;

import React, { useContext } from 'react';
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
import { toggleStepperModalAction } from '../data/actions';

const ZeroStateHighlights = ({ cardClassName }) => {
  const { dispatch, stepperModal: { isOpen } } = useContext(ContentHighlightsContext);
  return (
    <Row>
      <Col xs={12} sm={10} md={9} lg={8} xl={5}>
        <Card className={cardClassName}>
          <ZeroStateCardImage imageContainerClassName="bg-light-400 p-4" cardImage={cardImage} />
          <ZeroStateCardText textContainerClassName="text-center align-self-center">
            <h2 className="h3 mb-3">You haven&apos;t created any highlights yet.</h2>
            <p>
              Create and recommend course collections to your learners,
              enable them to quickly locate relevant content.
            </p>
          </ZeroStateCardText>

          <ZeroStateCardFooter>
            <Button
              onClick={() => dispatch(toggleStepperModalAction({ isOpen: true }))}
              iconBefore={Add}
              block
            >New highlight
            </Button>
          </ZeroStateCardFooter>
        </Card>
      </Col>
      <ContentHighlightStepper isModalOpen={isOpen} />
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

import React from 'react';
import {
  Card, Button, Col, Row,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Add } from '@edx/paragon/icons';
import cardImage from '../data/images/ContentHighlightImage.svg';
import ZeroStateCardImage from './ZeroStateCardImage';
import ZeroStateCardText from './ZeroStateCardText';
import ZeroStateCardFooter from './ZeroStateCardFooter';
import { useContentHighlightsContext } from '../data/hooks';
import { BUTTON_TEXT, HEADER_TEXT } from '../data/constants';

const ZeroStateHighlights = ({ cardClassName }) => {
  const { openStepperModal } = useContentHighlightsContext();
  return (
    <Row className="mt-5">
      <Col xs={12} sm={10} md={9} lg={8} xl={5}>
        <Card className={cardClassName}>
          <ZeroStateCardImage imageContainerClassName="bg-light-400 p-4" cardImage={cardImage} />
          <ZeroStateCardText textContainerClassName="text-center align-self-center">
            <h2 className="h3 mb-3">
              {HEADER_TEXT.zeroStateHighlights}
            </h2>
            <p>
              {HEADER_TEXT.SUB_TEXT.zeroStateHighlights}
            </p>
          </ZeroStateCardText>
          <ZeroStateCardFooter>
            <Button
              onClick={openStepperModal}
              iconBefore={Add}
              block
              data-testid={`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`}
            >
              {BUTTON_TEXT.zeroStateCreateNewHighlight}
            </Button>
          </ZeroStateCardFooter>
        </Card>
      </Col>
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

import React from 'react';
import {
  Card, Button, Col,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Add } from '@edx/paragon/icons';
import cardImage from './data/images/ContentHighlightImage.svg';
import ZeroStateCardImage from './ZeroStateCardImage';
import ZeroStateCardText from './ZeroStateCardText';
import ZeroStateCardFooter from './ZeroStateCardFooter';

function ZeroStateHighlights({ cardClassName }) {
  return (
    <Col xs={12} sm={8} lg={5}>
      <Card className={cardClassName}>
        <ZeroStateCardImage imageContainerClassName="bg-light-400 p-4" cardImage={cardImage} />
        <ZeroStateCardText textContainerClassName="text-center w-75 align-self-center pb-0">
          <h2>You haven&apos;t created any &quot;highlights&quot; collections yet.</h2>
          <p className="mb-4">&quot;Highlights&quot; feature allows you to create and recommend course collections to your learners,
            enable them to quickly locate relevant content.
          </p>
        </ZeroStateCardText>
        <ZeroStateCardFooter footerClassName="pb-0 mb-4.5">
          <Button iconBefore={Add} block>New Highlight</Button>
        </ZeroStateCardFooter>
      </Card>
    </Col>
  );
}
ZeroStateHighlights.propTypes = {
  cardClassName: PropTypes.string,
};
ZeroStateHighlights.defaultProps = {
  cardClassName: undefined,
};

export default ZeroStateHighlights;

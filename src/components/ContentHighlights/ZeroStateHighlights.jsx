import React from 'react';
import {
  Card, Button, useMediaQuery, breakpoints,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Add } from '@edx/paragon/icons';
import cardImage from './data/images/ContentHighlightImage.svg';
import ZeroStateCardImage from './ZeroStateCardImage';
import ZeroStateCardText from './ZeroStateCardText';
import ZeroStateCardFooter from './ZeroStateCardFooter';

const ZeroStateHighlights = ({ cardClassName }) => {
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.large.minWidth });

  return (
    <Card className={cardClassName} style={{ width: isExtraSmall ? '100%' : '949px' }}>
      <ZeroStateCardImage imageContainerClassNames="bg-light-400 p-4" cardImage={cardImage} />
      <ZeroStateCardText textContainerClassNames="text-center w-75 align-self-center pb-0">
        <h3>You haven&apos;t created any &quot;highlights&quot; collections yet.</h3>
        <p>Highlights are a selection of courses that help your learner navigate to the appropriate content faster.</p>
      </ZeroStateCardText>
      <ZeroStateCardFooter>
        <Button iconBefore={Add} className="w-100">New Highlight</Button>
      </ZeroStateCardFooter>
    </Card>
  );
};
ZeroStateHighlights.propTypes = {
  cardClassName: PropTypes.string,
};
ZeroStateHighlights.defaultProps = {
  cardClassName: '',
};

export default ZeroStateHighlights;

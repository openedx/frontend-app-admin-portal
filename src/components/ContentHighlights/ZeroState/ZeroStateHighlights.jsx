import React, { useContext } from 'react';
import {
  Card, Button, Col, Row,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Add } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import cardImage from '../data/images/ContentHighlightImage.svg';
import ZeroStateCardImage from './ZeroStateCardImage';
import ZeroStateCardText from './ZeroStateCardText';
import ZeroStateCardFooter from './ZeroStateCardFooter';
import { useContentHighlightsContext } from '../data/hooks';
import { BUTTON_TEXT, HEADER_TEXT } from '../data/constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import EVENT_NAMES from '../../../eventTracking';
import { extractHighlightSetUUID } from '../data/utils';

const ZeroStateHighlights = ({ enterpriseId, cardClassName }) => {
  const { openStepperModal } = useContentHighlightsContext();
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets,
      },
    },
  } = useContext(EnterpriseAppContext);

  const handleNewHighlightClick = () => {
    openStepperModal();
    const trackInfo = {
      existing_highlight_set_uuids: extractHighlightSetUUID(highlightSets),
      existing_highlight_set_count: highlightSets.length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.NEW_HIGHLIGHT}`,
      trackInfo,
    );
  };
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
              onClick={handleNewHighlightClick}
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
  enterpriseId: PropTypes.string.isRequired,

  cardClassName: PropTypes.string,
};

ZeroStateHighlights.defaultProps = {
  cardClassName: undefined,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ZeroStateHighlights);

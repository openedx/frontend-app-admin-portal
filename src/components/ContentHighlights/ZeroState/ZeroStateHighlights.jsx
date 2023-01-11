import React, { useContext } from 'react';
import { useContextSelector } from 'use-context-selector';
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
import ContentHighlightStepper from '../HighlightStepper/ContentHighlightStepper';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useContentHighlightsContext } from '../data/hooks';
import { BUTTON_TEXT } from '../data/constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import EVENT_NAMES from '../../../eventTracking';

const ZeroStateHighlights = ({ enterpriseId, cardClassName }) => {
  const { openStepperModal } = useContentHighlightsContext();
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets,
      },
    },
  } = useContext(EnterpriseAppContext);
  const isStepperModalOpen = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isOpen);
  const handleNewHighlightClick = () => {
    openStepperModal();
    const trackInfo = {
      existing_highlight_set_uuids: highlightSets.map(set => set.uuid),
      existing_highlight_set_count: highlightSets.length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.NEW_HIGHLIGHT}`,
      trackInfo,
    );
  };
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
              onClick={handleNewHighlightClick}
              iconBefore={Add}
              block
            >
              {BUTTON_TEXT.zeroStateCreateNewHighlight}
            </Button>
          </ZeroStateCardFooter>
        </Card>
      </Col>
      <ContentHighlightStepper isModalOpen={isStepperModalOpen} />
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

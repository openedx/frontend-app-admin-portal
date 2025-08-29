import React, { useContext } from 'react';
import {
  Card, Button, Col, Row,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { Add } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import cardImage from '../data/images/ContentHighlightImage.svg';
import ZeroStateCardImage from './ZeroStateCardImage';
import ZeroStateCardText from './ZeroStateCardText';
import ZeroStateCardFooter from './ZeroStateCardFooter';
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
    <Row className="mt-5">
      <Col xs={12} sm={10} md={9} lg={8} xl={5}>
        <Card className={cardClassName}>
          <ZeroStateCardImage imageContainerClassName="bg-light-400 p-4" cardImage={cardImage} />
          <ZeroStateCardText textContainerClassName="text-center align-self-center">
            <h2 className="h3 mb-3">
              <FormattedMessage
                id="highlights.highlights.tab.zero.state.header.message"
                defaultMessage="You haven't created any highlights yet."
                description="Header message shown to admin where there are no highlights created so far."
              />
            </h2>
            <p>
              <FormattedMessage
                id="highlights.highlights.tab.zero.state.detail.message"
                defaultMessage="Create and recommend content collections to your learners, enabling them to quickly locate content relevant to them."
                description="Detail message shown to admin where there are no highlights created so far."
              />
            </p>
          </ZeroStateCardText>
          <ZeroStateCardFooter>
            <Button
              onClick={handleNewHighlightClick}
              iconBefore={Add}
              block
              data-testid={`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`}
            >
              <FormattedMessage
                id="highlights.highlights.tab.zero.state.create.new.highlight.button.text"
                defaultMessage="New highlight"
                description="Button text shown to admin to create a new highlight."
              />
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

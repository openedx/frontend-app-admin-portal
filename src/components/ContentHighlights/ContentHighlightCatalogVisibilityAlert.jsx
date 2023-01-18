import React, { useContext } from 'react';
import {
  Alert, Button, Row, Col,
} from '@edx/paragon';
import { Info, Add } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useContextSelector } from 'use-context-selector';
import { ALERT_TEXT, BUTTON_TEXT } from './data/constants';
import { useContentHighlightsContext } from './data/hooks';
import EVENT_NAMES from '../../eventTracking';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { ContentHighlightsContext } from './ContentHighlightsContext';

const ContentHighlightCatalogVisibilityAlert = () => {
  const { openStepperModal } = useContentHighlightsContext();
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets, enterpriseCustomer,
      },
    },
  } = useContext(EnterpriseAppContext);
  const catalogVisibilityAlert = useContextSelector(
    ContentHighlightsContext,
    v => v[0].catalogVisibilityAlert,
  );
  const handleNewHighlightClick = () => {
    openStepperModal();
    const trackInfo = {
      existing_highlight_set_uuids: highlightSets.map(set => set.uuid),
      existing_highlight_set_count: highlightSets.length,
    };
    sendEnterpriseTrackEvent(
      enterpriseCustomer,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.NEW_HIGHLIGHT}`,
      trackInfo,
    );
  };
  if (catalogVisibilityAlert) {
    return (
      <Row className="mb-4.5">
        <Col xs={12} sm={10} md={9} lg={8}>
          <Alert
            variant="danger"
            icon={Info}
          >
            <Alert.Heading>
              {ALERT_TEXT.HEADER_TEXT.catalogVisibilityAPI}
            </Alert.Heading>
            <p>
              {ALERT_TEXT.SUB_TEXT.catalogVisibilityAPI}
            </p>
          </Alert>
        </Col>
      </Row>
    );
  }
  if (highlightSets.length < 1) {
    return (
      <Row className="mb-4.5">
        <Col xs={12} sm={10} md={9} lg={8}>
          <Alert
            variant="danger"
            icon={Info}
          >
            <div className="d-flex">
              <div style={{ flex: '0 0 80%' }}>
                <Alert.Heading>
                  {ALERT_TEXT.HEADER_TEXT.catalogVisibility}
                </Alert.Heading>
                <p>
                  {ALERT_TEXT.SUB_TEXT.catalogVisibility}
                </p>
              </div>
              <div className="align-self-center">
                <Button
                  onClick={handleNewHighlightClick}
                  data-testid={`catalog-visibility-alert-${BUTTON_TEXT.catalogVisibility}`}
                  iconBefore={Add}
                  block
                >
                  {BUTTON_TEXT.catalogVisibility}
                </Button>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>
    );
  }
  return null;
};

export default ContentHighlightCatalogVisibilityAlert;

import React, { useContext } from 'react';
import {
  Alert, Button, Row, Col,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Info, Add } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useContextSelector } from 'use-context-selector';
import { BUTTON_TEXT } from '../data/constants';
import { useContentHighlightsContext } from '../data/hooks';
import EVENT_NAMES from '../../../eventTracking';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const ContentHighlightCatalogVisibilityAlert = () => {
  const { openStepperModal } = useContentHighlightsContext();
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets, enterpriseCustomer,
      },
    },
  } = useContext(EnterpriseAppContext);
  const catalogVisibilityAlertOpen = useContextSelector(
    ContentHighlightsContext,
    v => v[0].catalogVisibilityAlertOpen,
  );
  const handleNewHighlightClick = () => {
    const trackInfo = {
      existing_highlight_set_uuids: highlightSets.map(set => set.uuid),
      existing_highlight_set_count: highlightSets.length,
    };
    sendEnterpriseTrackEvent(
      enterpriseCustomer,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.NEW_HIGHLIGHT}`,
      trackInfo,
    );

    openStepperModal();
  };

  if (catalogVisibilityAlertOpen) {
    return (
      <Row className="mb-4.5">
        <Col xs={12} sm={10} md={9} lg={8}>
          <Alert
            variant="danger"
            icon={Info}
          >
            <Alert.Heading>
              <FormattedMessage
                id="highlights.catalog.visibility.tab.catalog.visibility.not.updated.alert.error.header.title"
                defaultMessage="Catalog visibility not updated"
                description="Header title for error alert shown to admin when catalog visibility failed to update."
              />
            </Alert.Heading>
            <p>
              <FormattedMessage
                id="highlights.catalog.visibility.tab.catalog.visibility.not.updated.alert.error.detail.message"
                defaultMessage="Something went wrong when updating your setting. Please try again."
                description="Detail message for error alert shown to admin when catalog visibility failed to update."
              />
            </p>
          </Alert>
        </Col>
      </Row>
    );
  }

  if (highlightSets.length > 0) {
    return null;
  }

  return (
    <Row className="mb-4.5">
      <Col xs={12} sm={10} md={9} lg={8}>
        <Alert
          variant="danger"
          icon={Info}
          actions={[
            <Button
              onClick={handleNewHighlightClick}
              data-testid={`catalog-visibility-alert-${BUTTON_TEXT.catalogVisibility}`}
              iconBefore={Add}
            >
              <FormattedMessage
                id="highlights.catalog.visibility.tab.create.new.highlight.button.text"
                defaultMessage="New highlight"
                description="Button text shown to admin to create a new highlight."
              />
            </Button>,
          ]}
        >
          <Alert.Heading>
            <FormattedMessage
              id="highlights.catalog.visibility.tab.create.new.highlight.alert.header.text"
              defaultMessage="No highlights created"
              description="Header text for alert shown to admin when no highlights are created."
            />
          </Alert.Heading>
          <p>
            <FormattedMessage
              id="highlights.catalog.visibility.tab.create.new.highlight.alert.header.detail.text"
              defaultMessage="At least one highlight has to be created to make a selection"
              description="Detail text for alert shown to admin when no highlights are created."
            />
          </p>
        </Alert>
      </Col>
    </Row>
  );
};

export default ContentHighlightCatalogVisibilityAlert;

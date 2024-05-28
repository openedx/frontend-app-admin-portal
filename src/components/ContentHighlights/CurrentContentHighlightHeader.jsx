import React, { useContext, useState, useEffect } from 'react';

import {
  Button, ActionRow, Alert,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { connect } from 'react-redux';
import { Add, Info } from '@openedx/paragon/icons';
import { useContentHighlightsContext } from './data/hooks';
import EVENT_NAMES from '../../eventTracking';
import ContentHighlightArchivedAlert from './ContentHighlightArchivedAlert';

import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import {
  BUTTON_TEXT, MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION,
} from './data/constants';

const CurrentContentHighlightHeader = ({ enterpriseId }) => {
  const {
    enterpriseCuration: {
      enterpriseCuration: {
        highlightSets,
      },
      isNewArchivedContent,
    },
  } = useContext(EnterpriseAppContext);

  const { openStepperModal } = useContentHighlightsContext();
  const [maxHighlightsReached, setMaxHighlightsReached] = useState(false);
  const [showMaxHighlightsAlert, setShowMaxHighlightsAlert] = useState(false);
  const [isArchivedAlertOpen, setIsArchivedAlertOpen] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    setIsArchivedAlertOpen(isNewArchivedContent);
  }, [isNewArchivedContent]);

  useEffect(() => {
    // using greater than or equal as an additional buffer as opposed to exactly equal
    if (highlightSets.length >= MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION) {
      setMaxHighlightsReached(true);
    } else {
      setMaxHighlightsReached(false);
    }
  }, [highlightSets]);

  const createNewHighlight = () => {
    if (maxHighlightsReached) {
      setShowMaxHighlightsAlert(true);
      const trackInfo = {
        existing_highlight_set_uuids: highlightSets.map(set => set.uuid),
        existing_highlight_set_count: highlightSets.length,
      };
      sendEnterpriseTrackEvent(
        enterpriseId,
        `${EVENT_NAMES.CONTENT_HIGHLIGHTS.NEW_HIGHLIGHT_MAX_REACHED}`,
        trackInfo,
      );
    } else {
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
    }
  };
  return (
    <>
      <ActionRow>
        <h2 className="m-0">
          <FormattedMessage
            id="highlights.highlights.tab.header.title"
            defaultMessage="Highlights"
            description="Header title when we have atleast one highlight is present."
          />
        </h2>
        <ActionRow.Spacer />

        <Button
          iconBefore={Add}
          onClick={createNewHighlight}
        >
          {BUTTON_TEXT.createNewHighlight}
        </Button>
      </ActionRow>
      <p>
        <FormattedMessage
          id="highlights.catalog.visibility.tab.catalog.visibility.not.updated.alert.error.header.title.message"
          defaultMessage="Create up to {maxHighlights} highlights for your learners."
          description="Header title for error alert shown to admin when catalog visibility failed to update."
          values={{
            maxHighlights: MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION,
          }}
        />
      </p>
      <ContentHighlightArchivedAlert open={isArchivedAlertOpen} onClose={() => setIsArchivedAlertOpen(false)} />
      <Alert
        variant="danger"
        icon={Info}
        dismissible
        closeLabel={intl.formatMessage({
          id: 'highlights.highlights.tab.create.highlight.max.limit.reached.alert.dismiss.button.label',
          defaultMessage: 'Dismiss',
          description: 'Dismiss button label for error alert shown to admin when highlight creation limit is reached.',
        })}
        show={showMaxHighlightsAlert}
        onClose={() => setShowMaxHighlightsAlert(false)}
      >
        <Alert.Heading>
          <FormattedMessage
            id="highlights.highlights.tab.create.highlight.max.limit.reached.alert.header.message"
            defaultMessage="Highlight limit reached"
            description="Header title for error alert shown to admin when highlight creation limit is reached."
          />
        </Alert.Heading>
        <p>
          <FormattedMessage
            id="highlights.highlights.tab.create.highlight.max.limit.reached.alert.detail.message"
            defaultMessage="Delete at least one highlight to create a new one."
            description="Subtext for error alert shown to admin when highlight creation limit is reached."
          />
        </p>
      </Alert>
    </>
  );
};

CurrentContentHighlightHeader.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CurrentContentHighlightHeader);

import React from 'react';
import {
  ActionRow, Alert, Button, CardGrid, useToggle,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentHighlightCardItem from './ContentHighlightCardItem';
import {
  DEFAULT_ERROR_MESSAGE,
  HIGHLIGHTS_CARD_GRID_COLUMN_SIZES,
  MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
} from './data/constants';
import SkeletonContentCardContainer from './SkeletonContentCardContainer';
import { generateAboutPageUrl } from './data/utils';
import EVENT_NAMES from '../../eventTracking';
import { features } from '../../config';
import DeleteArchivedHighlightsDialogs from './DeleteArchivedHighlightsDialogs';
import { isArchivedContent } from '../../utils';

const ContentHighlightsCardItemsContainer = ({
  enterpriseId, enterpriseSlug, isLoading, highlightedContent, updateHighlightSet,
}) => {
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

  const {
    FEATURE_HIGHLIGHTS_ARCHIVE_MESSAGING,
  } = features;
  if (isLoading) {
    return (
      <SkeletonContentCardContainer itemCount={MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET} />
    );
  }
  if (!highlightedContent || highlightedContent?.length === 0) {
    return (
      <Alert data-testid="empty-highlighted-content" variant="warning">
        {DEFAULT_ERROR_MESSAGE.EMPTY_HIGHLIGHT_SET}
      </Alert>
    );
  }

  const archivedContent = [];
  const activeContent = [];

  if (FEATURE_HIGHLIGHTS_ARCHIVE_MESSAGING) {
    for (let i = 0; i < highlightedContent.length; i++) {
      if (isArchivedContent(highlightedContent[i])) {
        archivedContent.push(highlightedContent[i]);
      } else {
        activeContent.push(highlightedContent[i]);
      }
    }
  } else {
    activeContent.push(...highlightedContent);
  }
  const updateSetWithActiveContent = () => updateHighlightSet(activeContent);

  const archivedContentKeys = archivedContent.map(({ contentKey }) => contentKey);
  const activeContentUuids = activeContent.map(({ uuid }) => uuid);

  const trackClickEvent = ({ aggregationKey }) => {
    const trackInfo = {
      aggregation_key: aggregationKey,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.HIGHLIGHT_DASHBOARD_SET_ABOUT_PAGE}`,
      trackInfo,
    );
  };
  return (
    <>
      <CardGrid columnSizes={HIGHLIGHTS_CARD_GRID_COLUMN_SIZES}>
        {activeContent.map(({
          uuid, title, contentType, authoringOrganizations, contentKey, cardImageUrl, aggregationKey,
        }) => (
          <ContentHighlightCardItem
            isLoading={isLoading}
            key={uuid}
            cardImageUrl={cardImageUrl}
            title={title}
            archived={false}
            hyperlinkAttrs={
            {
              href: generateAboutPageUrl({
                enterpriseSlug,
                contentType: contentType.toLowerCase(),
                contentKey,
              }),
              target: '_blank',
              onClick: () => trackClickEvent({ aggregationKey }),
            }
        }
            contentType={contentType.toLowerCase()}
            partners={authoringOrganizations}
          />
        ))}
      </CardGrid>
      {archivedContent.length > 0 && (
        <>
          <DeleteArchivedHighlightsDialogs
            isDeleteModalOpen={isDeleteModalOpen}
            closeDeleteModal={closeDeleteModal}
            archivedContentKeys={archivedContentKeys}
            activeContentUuids={activeContentUuids}
            updateSetWithActiveContent={updateSetWithActiveContent}
          />
          <ActionRow>
            <h3 className="m-0">
              <FormattedMessage
                id="highlights.highlights.tab.archived.courses.section.heading.title"
                defaultMessage="Archived"
                description="Header title for archived courses section on highlights tab."
              />
            </h3>
            <ActionRow.Spacer />
            <Button onClick={openDeleteModal} variant="outline-primary">
              <FormattedMessage
                id="highlights.highlights.tab.archived.courses.delete.button.label"
                defaultMessage="Delete archived courses"
                description="Button label to delete archived courses on highlights tab."
              />
            </Button>
          </ActionRow>
          <div className="mb-4.5">
            <FormattedMessage
              id="highlights.highlights.tab.archived.courses.section.subheading"
              defaultMessage="Learners are no longer able to enroll in archived courses, but past learners can still access course materials."
              description="Subheading for archived courses section on highlights tab."
            />
          </div>
          <CardGrid columnSizes={HIGHLIGHTS_CARD_GRID_COLUMN_SIZES}>
            {archivedContent.map(({
              uuid, title, contentType, authoringOrganizations, contentKey, cardImageUrl, aggregationKey,
            }) => (
              <ContentHighlightCardItem
                isLoading={isLoading}
                key={uuid}
                cardImageUrl={cardImageUrl}
                title={title}
                archived
                hyperlinkAttrs={
          {
            href: generateAboutPageUrl({
              enterpriseSlug,
              contentType: contentType.toLowerCase(),
              contentKey,
            }),
            target: '_blank',
            onClick: () => trackClickEvent({ aggregationKey }),
          }
      }
                contentType={contentType.toLowerCase()}
                partners={authoringOrganizations}
              />
            ))}
          </CardGrid>
        </>
      )}
    </>
  );
};

ContentHighlightsCardItemsContainer.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  highlightedContent: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']),
    title: PropTypes.string,
    cardImageUrl: PropTypes.string,
    authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      logoImageUrl: PropTypes.string,
      uuid: PropTypes.string,
    })),
    courseRunStatuses: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
  updateHighlightSet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightsCardItemsContainer);

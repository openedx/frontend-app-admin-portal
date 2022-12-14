import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Delete } from '@edx/paragon/icons';
import { IconButton, Icon } from '@edx/paragon';
import { connect } from 'react-redux';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { useContentHighlightsContext } from '../data/hooks';
import { generateAboutPageUrl } from '../data/constants';

const ContentConfirmContentCard = ({ enterpriseSlug, original }) => {
  const { deleteSelectedRowId } = useContentHighlightsContext();
  const [deleteKey, setDeleteKey] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const {
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
    firstEnrollablePaidSeatPrice,
    aggregationKey,
    key,
  } = original;
  // eslint-disable-next-line no-shadow
  useEffect(() => {
    if (deleteKey === aggregationKey) {
      deleteSelectedRowId(deleteKey);
      setIsDeleted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteKey, aggregationKey]);
  if (isDeleted) {
    return (
      null
    );
  }
  return (
    <React.Fragment key={key}>
      <ContentHighlightCardItem
        title={title}
        hyperlink={generateAboutPageUrl(enterpriseSlug, contentType?.toLowerCase(), aggregationKey?.split(':')[1])}
        contentType={contentType}
        partners={partners}
        cardImageUrl={cardImageUrl || originalImageUrl}
        price={firstEnrollablePaidSeatPrice}

      />
      <IconButton
        invertColors
        isActive
        src={Delete}
        iconAs={Icon}
        alt="Delete"
        onClick={() => setDeleteKey(aggregationKey)}
        className="ml-1 flex-shrink-0"
      />
    </React.Fragment>
  );
};

ContentConfirmContentCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  original: PropTypes.shape({
    title: PropTypes.string,
    contentType: PropTypes.string,
    partners: PropTypes.arrayOf(PropTypes.shape()),
    cardImageUrl: PropTypes.string,
    originalImageUrl: PropTypes.string,
    firstEnrollablePaidSeatPrice: PropTypes.number,
    aggregationKey: PropTypes.string,
    key: PropTypes.string,
  }).isRequired,
};

export const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentConfirmContentCard);

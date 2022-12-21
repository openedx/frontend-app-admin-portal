import React from 'react';
import PropTypes from 'prop-types';
import { Delete } from '@edx/paragon/icons';
import { IconButton, Icon } from '@edx/paragon';
import { connect } from 'react-redux';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { useContentHighlightsContext } from '../data/hooks';
import { generateAboutPageUrl } from '../data/utils';

const ContentConfirmContentCard = ({ enterpriseSlug, original }) => {
  const { deleteSelectedRowId } = useContentHighlightsContext();
  const {
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
    firstEnrollablePaidSeatPrice,
    aggregationKey,
  } = original;

  return (
    <div className="d-flex w-100" data-testid="title-test">
      <ContentHighlightCardItem
        title={title}
        href={
          {
            destination: generateAboutPageUrl({
              enterpriseSlug,
              contentType: contentType?.toLowerCase(),
              contentKey: aggregationKey?.split(':')[1],
            }),
            target: '_blank',
            onClick: () => console.log('test1'),
          }
}
        contentType={contentType}
        partners={partners}
        cardImageUrl={cardImageUrl || originalImageUrl}
        price={firstEnrollablePaidSeatPrice}

      />
      <IconButton
        src={Delete}
        iconAs={Icon}
        alt={`Remove ${title} from highlight collection`}
        onClick={() => deleteSelectedRowId(aggregationKey)}
        className="ml-1 flex-shrink-0"
      />
    </div>
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
  }).isRequired,
};

export const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentConfirmContentCard);

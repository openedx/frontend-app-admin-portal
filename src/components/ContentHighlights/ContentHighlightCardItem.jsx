import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Hyperlink, Icon, Truncate,
} from '@openedx/paragon';
import { Archive } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import cardImageCapFallbackSrc from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { features } from '../../config';
import { getContentHighlightCardFooter } from './data/utils';

const ContentHighlightCardItem = ({
  isLoading,
  title,
  hyperlinkAttrs,
  contentType,
  partners,
  cardImageUrl,
  price,
  archived,
}) => {
  const {
    FEATURE_HIGHLIGHTS_ARCHIVE_MESSAGING,
  } = features;
  const intl = useIntl();
  const formattedContentTypes = {
    course: intl.formatMessage({
      id: 'highlights.highlights.tab.content.type.course.label',
      defaultMessage: 'Course',
      description: 'Label for course content type in the highlight content card',
    }),
    program: intl.formatMessage({
      id: 'highlights.highlights.tab.content.type.program.label',
      defaultMessage: 'Program',
      description: 'Label for program content type in the highlight content card',
    }),
    learnerpathway: intl.formatMessage({
      id: 'highlights.highlights.tab.content.type.pathway.label',
      defaultMessage: 'Pathway',
      description: 'Label for pathway content type in the highlight content card',
    }),
  };
  const cardInfo = {
    cardImgSrc: cardImageUrl,
    cardLogoSrc: partners.length === 1 ? partners[0].logoImageUrl : undefined,
    cardLogoAlt: partners.length === 1 ? `${partners[0].name}'s logo` : undefined,
    cardTitle: <Truncate lines={3} title={title}>{title}</Truncate>,
    cardSubtitle: partners.map(p => p.name).join(', '),
    cardFooter: getContentHighlightCardFooter(
      { price, formattedContentType: formattedContentTypes[contentType?.toLowerCase()] },
    ),
  };
  if (hyperlinkAttrs) {
    cardInfo.cardTitle = (
      <Hyperlink onClick={hyperlinkAttrs.onClick} destination={hyperlinkAttrs.href} target={hyperlinkAttrs.target} data-testid="hyperlink-title">
        <Truncate elementType="span" lines={3} title={title}>{title}</Truncate>
      </Hyperlink>
    );
  }
  return (
    <Card variant={contentType !== 'course' && 'dark'} isLoading={isLoading}>
      <Card.ImageCap
        src={cardInfo.cardImgSrc}
        fallbackSrc={cardImageCapFallbackSrc}
        srcAlt=""
        logoSrc={cardInfo.cardLogoSrc}
        logoAlt={cardInfo.cardLogoAlt}
      />
      <Card.Header
        title={cardInfo.cardTitle}
        subtitle={(
          <Truncate lines={2} title={cardInfo.cardSubtitle}>{cardInfo.cardSubtitle}</Truncate>
        )}
      />
      {contentType && (
        <>
          <Card.Section />
          {FEATURE_HIGHLIGHTS_ARCHIVE_MESSAGING && archived && (
          <p className="ml-3 mb-4 mt-0 d-flex small text-gray-400">
            <Icon src={Archive} className="mr-1" />
            <FormattedMessage
              id="highlights.highlights.tab.highlight.item.card.archived.content.label"
              defaultMessage="Archived"
              description="Label for archived content in the highlight content card"
            />
          </p>
          )}
          <Card.Footer
            textElement={cardInfo.cardFooter}
          />
        </>
      )}
    </Card>
  );
};

ContentHighlightCardItem.propTypes = {
  isLoading: PropTypes.bool,
  cardImageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  hyperlinkAttrs: PropTypes.shape({
    href: PropTypes.string,
    target: PropTypes.string,
    onClick: PropTypes.func,
  }),
  contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']).isRequired,
  partners: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    logoImageUrl: PropTypes.string,
  })).isRequired,
  price: PropTypes.number,
  archived: PropTypes.bool,
};

ContentHighlightCardItem.defaultProps = {
  isLoading: false,
  hyperlinkAttrs: undefined,
  cardImageUrl: undefined,
  price: undefined,
  archived: false,
};

export default ContentHighlightCardItem;

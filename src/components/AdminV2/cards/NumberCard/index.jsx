import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, Card, Collapsible,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import DetailsAction from './DetailsAction';

const NumberCard = ({
  title, icon, description, detailActions,
}) => {
  const handleDetailsActionClick = () => {
    const element = document.getElementById('learner-progress-report');
    if (element) {
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  return (
    <Card>
      <Card.Header
        title={(
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="h2">
              {typeof title === 'number' ? title.toLocaleString() : title}
            </h2>
            {icon && <Icon src={icon} />}
          </div>
        )}
        subtitle={description}
      />
      <Card.Section>
        <Collapsible
          styling="basic"
          title={(
            <FormattedMessage
              id="adminPortal.cards.collapsible.details"
              defaultMessage="Details"
            />
          )}
        >
          {
            detailActions?.map(action => (
              <DetailsAction
                slug={action.slug}
                label={action.label}
                isLoading={action.isLoading}
                key={action.label}
                onClick={handleDetailsActionClick}
              />
            ))
          }
        </Collapsible>
      </Card.Section>
    </Card>
  );
};

NumberCard.defaultProps = {
  icon: null,
  detailActions: null,
};

NumberCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.func,
  detailActions: PropTypes.arrayOf(PropTypes.shape({
    slug: PropTypes.string,
    label: PropTypes.string,
    isLoading: PropTypes.bool,
  })),
};

export default NumberCard;

import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon, Card, Collapsible,
} from '@openedx/paragon';

import DetailsAction from './DetailsAction';

const NumberCard = ({
  title, icon, description, detailActions,
}) => {
  const handleDetailsActionClick = (event) => {
    const element = document.getElementById('learner-progress-report');
    if (event) {
      event.target.click();
    }
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 0);
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
          title="Details"
        >
          {
            detailActions && detailActions.map(action => (
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

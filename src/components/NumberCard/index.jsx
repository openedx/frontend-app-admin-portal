import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Icon, Button } from '@edx/paragon';

import './NumberCard.scss';

class NumberCard extends React.Component {
  formatTitle(title) {
    if (typeof title === 'number') {
      return title.toLocaleString();
    }
    return title;
  }

  render() {
    const {
      className,
      title,
      iconClassName,
      description,
      collapsible,
      onCollapsibleFilterClick,
    } = this.props;
    return (
      <div className={classNames(['card', 'number-card', className])}>
        <div className="card-body">
          <h5 className="card-title d-flex align-items-center justify-content-between">
            <span>
              {this.formatTitle(title)}
            </span>
            {iconClassName &&
              <Icon className={[
                  iconClassName,
                  'd-flex',
                  'align-items-center',
                  'justify-content-center',
                ]}
              />
            }
          </h5>
          <p className="card-text">{description}</p>
        </div>
        {collapsible &&
          <Button
            label={collapsible.filters[0].label}
            onClick={() => onCollapsibleFilterClick(0)}
            className={['btn-link']}
          />
        }
      </div>
    );
  }
}

NumberCard.defaultProps = {
  className: null,
  iconClassName: null,
  collapsible: null,
};

const filterShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
});

NumberCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  collapsible: PropTypes.shape({
    filters: PropTypes.arrayOf(filterShape),
  }),
  onCollapsibleFilterClick: PropTypes.func.isRequired,
};

export default NumberCard;

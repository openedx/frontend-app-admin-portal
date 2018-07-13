import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from '@edx/paragon';

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
    } = this.props;
    return (
      <div className={classNames(['card', className])}>
        <div className="card-body">
          <h5 className="card-title d-flex align-items-center justify-content-between">
            <span className="title">
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
      </div>
    );
  }
}

NumberCard.defaultProps = {
  className: null,
  iconClassName: null,
};

NumberCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
};

export default NumberCard;

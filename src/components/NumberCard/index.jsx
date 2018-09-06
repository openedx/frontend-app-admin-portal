import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { Link, withRouter } from 'react-router-dom';

import './NumberCard.scss';

import { removeTrailingSlash } from '../../utils';

export const triggerKeys = {
  OPEN_DETAILS: ['ArrowDown', 'Enter'],
  CLOSE_DETAILS: ['Escape'],
  NAVIGATE_DOWN: ['ArrowDown', 'Tab'],
  NAVIGATE_UP: ['ArrowUp'],
  SELECT_ACTION: ['Enter', ' '],
};

class NumberCard extends React.Component {
  static isTriggerKey(action, keyName) {
    return triggerKeys[action].indexOf(keyName) > -1;
  }

  constructor(props) {
    super(props);

    this.detailActionItemRefs = [];
    this.toggleDetailsBtnRef = null;
    this.containerRef = null;

    this.state = {
      detailsExpanded: false,
      focusIndex: 0,
    };

    this.toggleDetails = this.toggleDetails.bind(this);
    this.handleDetailsActionClick = this.handleDetailsActionClick.bind(this);
    this.handleToggleDetailsKeyDown = this.handleToggleDetailsKeyDown.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { focusIndex } = this.state;
    const { detailsExpanded } = this.props;

    if (detailsExpanded !== prevProps.detailsExpanded) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        detailsExpanded,
      });
    }

    if (focusIndex !== prevState.focusIndex) {
      this.detailActionItemRefs[this.state.focusIndex].focus();
    }
  }

  addEvents() {
    document.addEventListener('click', this.handleDocumentClick, true);
  }

  removeEvents() {
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  handleDocumentClick(e) {
    if (this.containerRef && this.containerRef.contains(e.target) &&
      this.containerRef !== e.target) {
      return;
    }
    this.toggleDetails();
  }

  formatTitle(title) {
    if (typeof title === 'number') {
      return title.toLocaleString();
    }
    return title;
  }

  toggleDetails() {
    const detailsExpanded = !this.state.detailsExpanded;
    this.setState({
      detailsExpanded,
      focusIndex: 0,
    }, () => {
      // Wait until after the state is set for the DOM elements
      // to render before we set focus.
      if (detailsExpanded) {
        this.detailActionItemRefs[this.state.focusIndex].focus();
        this.addEvents();
      } else {
        this.toggleDetailsBtnRef.focus();
        this.removeEvents();
      }
    });
  }

  closeDetails() {
    this.setState({
      detailsExpanded: false,
    });
  }

  handleDetailsActionClick(event) {
    if (event) {
      event.target.click();
    }
    this.toggleDetails();
  }

  handleToggleDetailsKeyDown(event) {
    const { detailsExpanded } = this.state;
    if (!detailsExpanded && NumberCard.isTriggerKey('OPEN_DETAILS', event.key)) {
      event.preventDefault();
      this.toggleDetails();
    } else if (detailsExpanded && NumberCard.isTriggerKey('CLOSE_DETAILS', event.key)) {
      this.toggleDetails();
    }
  }

  handleDetailsActionKeyDown(event) {
    const { focusIndex } = this.state;
    const { detailActions } = this.props;

    event.preventDefault();

    if (NumberCard.isTriggerKey('CLOSE_DETAILS', event.key)) {
      this.toggleDetails();
    } else if (NumberCard.isTriggerKey('SELECT_ACTION', event.key)) {
      this.handleDetailsActionClick(event);
    } else if (NumberCard.isTriggerKey('NAVIGATE_DOWN', event.key)) {
      this.setState({
        focusIndex: (focusIndex + 1) % detailActions.length,
      });
    } else if (NumberCard.isTriggerKey('NAVIGATE_UP', event.key)) {
      this.setState({
        focusIndex: ((focusIndex - 1) + detailActions.length) % detailActions.length,
      });
    }
  }

  renderDetailActions() {
    const { detailActions, match } = this.props;
    const { params: { slug } } = match;

    return detailActions.map((action, index) => (
      <Link
        innerRef={(node) => { this.detailActionItemRefs[index] = node; }}
        className={classNames(
          'btn',
          'btn-link',
          {
            active: action.slug === slug,
          },
        )}
        key={action.label}
        to={slug ? action.slug : `${removeTrailingSlash(match.url)}/${action.slug}`}
        onClick={() => { this.handleDetailsActionClick(); }}
        onKeyDown={event => this.handleDetailsActionKeyDown(event)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span className="label">
            {action.label}
          </span>
          {action.loading &&
            <Icon className={['fa', 'fa-spinner', 'fa-spin', 'ml-2']} />
          }
        </div>
      </Link>
    ));
  }

  render() {
    const { detailsExpanded } = this.state;
    const {
      className,
      title,
      iconClassName,
      description,
      detailActions,
    } = this.props;

    return (
      <div
        ref={(node) => { this.containerRef = node; }}
        className={classNames('number-card', {
          'has-details': detailActions,
        })}
      >
        <div className={classNames('card', className)}>
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
        </div>
        {detailActions &&
          <div className="card-footer">
            <div className="footer-title d-flex justify-content-between align-items-center">
              <span>
                {detailsExpanded ? 'Detailed breakdown' : 'Details'}
              </span>
              <Button
                inputRef={(node) => { this.toggleDetailsBtnRef = node; }}
                buttonType="link"
                className={['toggle-collapse']}
                label={
                  <Icon
                    className={[classNames(
                      'fa',
                      {
                        'fa-caret-down': !detailsExpanded,
                        'fa-close': detailsExpanded,
                      },
                    )]}
                    screenReaderText={detailsExpanded ? 'Close details' : 'Show details'}
                  />
                }
                onClick={this.toggleDetails}
                onKeyDown={this.handleToggleDetailsKeyDown}
              />
            </div>
            <div
              className={classNames(
                'footer-body',
                ' mt-1',
                {
                  'd-none': !detailsExpanded,
                },
              )}
            >
              {this.renderDetailActions()}
            </div>
          </div>
        }
      </div>
    );
  }
}

NumberCard.defaultProps = {
  className: null,
  iconClassName: null,
  detailActions: null,
  detailsExpanded: false,
};

NumberCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  detailActions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    loading: PropTypes.bool,
  })),
  detailsExpanded: PropTypes.bool,
  match: PropTypes.shape({
    params: PropTypes.shape({
      slug: PropTypes.string,
    }),
  }).isRequired,
};

export default withRouter(NumberCard);

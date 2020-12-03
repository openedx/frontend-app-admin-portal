import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { Link, withRouter } from 'react-router-dom';

import { removeTrailingSlash, isTriggerKey } from '../../utils';

export const triggerKeys = {
  OPEN_DETAILS: ['ArrowDown', 'Enter'],
  CLOSE_DETAILS: ['Escape'],
  NAVIGATE_DOWN: ['ArrowDown', 'Tab'],
  NAVIGATE_UP: ['ArrowUp'],
  SELECT_ACTION: ['Enter', ' '],
};

class NumberCard extends React.Component {
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
    if (this.containerRef && this.containerRef.contains(e.target)
      && this.containerRef !== e.target) {
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
    this.setState((state) => ({
      detailsExpanded: !state.detailsExpanded,
      focusIndex: 0,
    }), () => {
      // Wait until after the state is set for the DOM elements
      // to render before we set focus.
      if (this.state.detailsExpanded) {
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
    if (!detailsExpanded && isTriggerKey({ triggerKeys, action: 'OPEN_DETAILS', key: event.key })) {
      event.preventDefault();
      this.toggleDetails();
    } else if (detailsExpanded && isTriggerKey({ triggerKeys, action: 'CLOSE_DETAILS', key: event.key })) {
      this.toggleDetails();
    }
  }

  handleDetailsActionKeyDown(event) {
    const { focusIndex } = this.state;
    const { detailActions } = this.props;

    event.preventDefault();

    if (isTriggerKey({ triggerKeys, action: 'CLOSE_DETAILS', key: event.key })) {
      this.toggleDetails();
    } else if (isTriggerKey({ triggerKeys, action: 'SELECT_ACTION', key: event.key })) {
      this.handleDetailsActionClick(event);
    } else if (isTriggerKey({ triggerKeys, action: 'NAVIGATE_DOWN', key: event.key })) {
      this.setState({
        focusIndex: (focusIndex + 1) % detailActions.length,
      });
    } else if (isTriggerKey({ triggerKeys, action: 'NAVIGATE_UP', key: event.key })) {
      this.setState({
        focusIndex: ((focusIndex - 1) + detailActions.length) % detailActions.length,
      });
    }
  }

  renderDetailActions() {
    const { detailActions, match } = this.props;
    const { params: { actionSlug } } = match;

    return detailActions.map((action, index) => (
      <Link
        innerRef={(node) => { this.detailActionItemRefs[index] = node; }}
        className={classNames(
          'btn btn-link',
          {
            active: action.slug === actionSlug,
          },
        )}
        key={action.label}
        to={actionSlug ? action.slug : `${removeTrailingSlash(match.url)}/${action.slug}`}
        onClick={() => { this.handleDetailsActionClick(); }}
        onKeyDown={event => this.handleDetailsActionKeyDown(event)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span className="label">
            {action.label}
          </span>
          {action.loading
            && <Icon className="fa fa-spinner fa-spin ml-2" />}
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
      id,
    } = this.props;

    return (
      <div
        ref={(node) => { this.containerRef = node; }}
        className={classNames('number-card w-100', {
          'has-details': detailActions,
        })}
      >
        <div className={classNames('card', className)}>
          <div className="card-body">
            <h3 className="card-title d-flex align-items-center justify-content-between">
              <span>
                {this.formatTitle(title)}
              </span>
              {iconClassName && (
                <Icon
                  className={
                    classNames(
                      'd-flex align-items-center justify-content-center',
                      iconClassName,
                    )
                  }
                />
              )}
            </h3>
            <p className="card-text">{description}</p>
          </div>
        </div>
        {detailActions && (
          <div className="card-footer">
            <div className="footer-title">
              <Button
                variant="link"
                ref={(node) => { this.toggleDetailsBtnRef = node; }}
                className="toggle-collapse btn-block"
                onClick={this.toggleDetails}
                onKeyDown={this.handleToggleDetailsKeyDown}
                aria-expanded={detailsExpanded}
                aria-controls={`footer-body-${id}`}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="details-btn-text">
                    {detailsExpanded ? 'Detailed breakdown' : 'Details'}
                  </div>
                  <div>
                    <Icon
                      className={classNames(
                        'fa',
                        {
                          'fa-caret-down': !detailsExpanded,
                          'fa-close': detailsExpanded,
                        },
                      )}
                      screenReaderText={detailsExpanded ? 'Close details' : 'Show details'}
                    />
                  </div>
                </div>
              </Button>
            </div>
            <div
              id={`footer-body-${id}`}
              className={classNames(
                'footer-body mt-1',
                {
                  'd-none': !detailsExpanded,
                },
              )}
            >
              {this.renderDetailActions()}
            </div>
          </div>
        )}
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
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  detailActions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    loading: PropTypes.bool,
  })),
  detailsExpanded: PropTypes.bool,
  match: PropTypes.shape({
    url: PropTypes.string,
    params: PropTypes.shape({
      actionSlug: PropTypes.string,
    }),
  }).isRequired,
};

export default withRouter(NumberCard);

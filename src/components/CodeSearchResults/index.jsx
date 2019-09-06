import React from 'react';
import PropTypes from 'prop-types';
import { TransitionReplace } from '@edx/paragon';

import { isValidEmail, updateUrl } from '../../utils';

import StatusAlert from '../StatusAlert';
import CodeSearchResultsHeading from './CodeSearchResultsHeading';
import CodeSearchResultsTable from './CodeSearchResultsTable';

import './CodeSearchResults.scss';

class CodeSearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCodeReminderSuccessful: false,
      isCodeRevokeSuccessful: false,
      shouldRefreshTable: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { searchQuery, isOpen } = this.props;
    if (isOpen && searchQuery !== prevProps.searchQuery) {
      this.resetCodeActionMessages();
      this.resetShouldRefreshTable();
    }

    if (isOpen !== prevProps.isOpen) {
      updateUrl({ page: undefined });
    }
  }

  resetCodeActionMessages = () => {
    this.setState({
      isCodeReminderSuccessful: false,
      isCodeRevokeSuccessful: false,
    });
  };

  resetShouldRefreshTable = () => {
    this.setState({
      shouldRefreshTable: false,
    });
  };

  handleRemindOnSuccess = () => {
    this.setState({
      isCodeReminderSuccessful: true,
    });
  };

  handleRevokeOnSuccess = () => {
    updateUrl({ page: undefined });
    this.setState({
      isCodeRevokeSuccessful: true,
      shouldRefreshTable: true,
    });
  };

  isValidSearchQuery = () => {
    const { searchQuery } = this.props;
    return isValidEmail(searchQuery) === undefined;
  };

  renderSuccessMessage = options => (
    <StatusAlert
      alertType="success"
      iconClassName="fa fa-check"
      onClose={this.resetCodeActionMessages}
      dismissible
      {...options}
    />
  );

  renderErrorMessage = options => (
    <StatusAlert
      alertType="danger"
      iconClassName="fa fa-exclamation-circle"
      {...options}
    />
  );

  render() {
    const { isOpen, searchQuery, onClose } = this.props;
    const {
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      shouldRefreshTable,
    } = this.state;
    const isValidSearchQuery = this.isValidSearchQuery();
    return (
      <TransitionReplace>
        {isOpen ? (
          <div key="code-search-results" className="code-search-results border-bottom pb-4">
            <React.Fragment>
              <CodeSearchResultsHeading
                searchQuery={searchQuery}
                onClose={onClose}
              />
              {isValidSearchQuery ? (
                <React.Fragment>
                  {isCodeReminderSuccessful && this.renderSuccessMessage({
                    message: `A reminder was successfully sent to ${searchQuery}.`,
                  })}
                  {isCodeRevokeSuccessful && this.renderSuccessMessage({
                    message: 'Successfully revoked code(s)',
                  })}
                  <CodeSearchResultsTable
                    searchQuery={searchQuery}
                    shouldRefreshTable={shouldRefreshTable}
                    onRemindSuccess={this.handleRemindOnSuccess}
                    onRevokeSuccess={this.handleRevokeOnSuccess}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.renderErrorMessage({
                    message: 'Please enter a valid email address in your search.',
                  })}
                </React.Fragment>
              )}
            </React.Fragment>
          </div>
        ) : null}
      </TransitionReplace>
    );
  }
}

CodeSearchResults.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  searchQuery: PropTypes.string,
};

CodeSearchResults.defaultProps = {
  isOpen: false,
  searchQuery: null,
};

export default CodeSearchResults;

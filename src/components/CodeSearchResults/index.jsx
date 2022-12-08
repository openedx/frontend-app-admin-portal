import React from 'react';
import PropTypes from 'prop-types';
import { TransitionReplace, Alert } from '@edx/paragon';
import { CheckCircle } from '@edx/paragon/icons';

import { updateUrl } from '../../utils';

import CodeSearchResultsHeading from './CodeSearchResultsHeading';
import CodeSearchResultsTable from './CodeSearchResultsTable';

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

  renderSuccessMessage = options => (
    <Alert
      variant="success"
      icon={CheckCircle}
      onClose={this.resetCodeActionMessages}
      dismissible
    >
      {options.message}
    </Alert>
  );

  render() {
    const { isOpen, searchQuery, onClose } = this.props;
    const {
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      shouldRefreshTable,
    } = this.state;
    return (
      <TransitionReplace>
        {isOpen ? (
          <div key="code-search-results" className="code-search-results border-bottom pb-4">
            <CodeSearchResultsHeading
              searchQuery={searchQuery}
              onClose={onClose}
            />
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

import React from 'react';
import PropTypes from 'prop-types';
import { Alert, TransitionReplace } from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';

import { updateUrl } from '../../utils';

import CodeSearchResultsHeading from './CodeSearchResultsHeading';
import CodeSearchResultsTable from './CodeSearchResultsTable';
import { withLocation, withNavigate } from '../../hoc';

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
    const {
      searchQuery, isOpen, navigate, location,
    } = this.props;
    if (isOpen && searchQuery !== prevProps.searchQuery) {
      this.resetCodeActionMessages();
      this.resetShouldRefreshTable();
    }

    if (isOpen !== prevProps.isOpen) {
      updateUrl(navigate, location.pathname, { page: undefined });
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
    const { navigate, location } = this.props;
    updateUrl(navigate, location.pathname, { page: undefined });
    this.setState({
      isCodeRevokeSuccessful: true,
      shouldRefreshTable: true,
    });
  };

  renderSuccessMessage = message => (
    <Alert
      variant="success"
      icon={CheckCircle}
      onClose={this.resetCodeActionMessages}
      dismissible
    >
      <p>{message}</p>
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
            {isCodeReminderSuccessful && this.renderSuccessMessage(
              `A reminder was successfully sent to ${searchQuery}.`,
            )}
            {isCodeRevokeSuccessful && this.renderSuccessMessage(
              'Successfully revoked code(s)',
            )}
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
  navigate: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

CodeSearchResults.defaultProps = {
  isOpen: false,
  searchQuery: null,
};

export default withLocation(withNavigate(CodeSearchResults));

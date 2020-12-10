import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@edx/paragon';
import MoodleIntegrationConfigForm from './MoodleIntegrationConfigForm';
import LmsApiService from '../../data/services/LmsApiService';
import { camelCaseObject } from '../../utils';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';

class LmsConfigurations extends React.Component {
  state = {
    moodleConfig: null,
    error: null,
    loading: true,
  }

  componentDidMount() {
    Promise.allSettled([
      LmsApiService.fetchMoodleConfig(this.props.enterpriseId),
    ]).then((responses) => {
      if (responses.some(response => response.reason?.request.status === 400
          || response.reason?.request.status > 404)) {
        const errorRsp = responses.filter(response => response.reason?.request.status !== 404);
        const errorMsgs = [];
        let status = '';
        errorRsp.forEach((error) => {
          errorMsgs.push(error.reason.request.statusText);
          status = error.reason.request.status;
        });
        this.setState({ error: { response: { status }, message: errorMsgs.join(';') }, loading: false });
      } else {
        this.setState({
          moodleConfig: responses[0].status === 'fulfilled'
            ? responses[0].value.data.results[0] : null,
          loading: false,
        });
      }
    });
  }

  render() {
    const { moodleConfig, error, loading } = this.state;
    if (loading) {
      return <LoadingMessage className="overview" />;
    }
    if (error && error.response?.status !== 404) {
      return (
        <ErrorPage
          status={error.response?.status}
          message={error.message}
        />
      );
    }
    if (moodleConfig) {
      return (
        <MoodleIntegrationConfigForm
          config={camelCaseObject(moodleConfig)}
          enterpriseId={this.props.enterpriseId}
        />
      );
    }
    return (
      <>
        <div
          key="moodle-form-link"
          className="mb-3"
        >
          <Collapsible
            styling="card"
            className="shadow"
            title="Moodle"
          >
            <MoodleIntegrationConfigForm enterpriseId={this.props.enterpriseId} />
          </Collapsible>
        </div>
      </>
    );
  }
}

LmsConfigurations.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default LmsConfigurations;

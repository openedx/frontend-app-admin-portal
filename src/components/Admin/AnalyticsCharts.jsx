import React from 'react';

import TableauReport from 'tableau-react-embed';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import LoadingMessage from '../LoadingMessage';
import ErrorPage from '../ErrorPage';
import { configuration } from '../../config';


class AnalyticsCharts extends React.Component {
  state = {
    loading: true,
    error: undefined,
    token: '',
  };

  componentDidMount() {
    this.updateToken();
  }

  /**
   * Gets a new token and updates component state with the token.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  updateToken = async () => {
    try {
      const response = await EcommerceApiService.fetchTableauToken();
      this.setState({
        token: response.data,
        loading: false,
      });
      return undefined;
    } catch (error) {
      return error;
    }
  }

  render() {
    const { token, loading, error } = this.state;
    const url = configuration.TABLEAU_URL;
    const filters = {
      Segment: ['Consumer'], // Filter could be enterprise uuid
    };
    if (loading) {
      return <LoadingMessage className="overview" />;
    }
    if (error) {
      return (
        <ErrorPage
          status={error.response && error.response.status}
          message={error.message}
        />
      );
    }
    return (
      <React.Fragment>
        <div>
          <TableauReport
            url={url}
            token={token}
            filters={filters}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default AnalyticsCharts;

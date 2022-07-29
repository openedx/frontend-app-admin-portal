import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import LMSApiService from '../../data/services/LmsApiService';

class SamlConfiguration extends React.Component {
  state = {
    configs: [],
    loading: true,
  };

  componentDidMount() {
    LMSApiService.fetchSamlConfigurations()
      .then(response => this.setState({
        configs: response.data.results,
        loading: false,
      }))
      .catch((error) => {
        const errorMsg = error.message || error.response.status === 500
          ? error.message : JSON.stringify(error.response.data);
        logError(errorMsg);
        this.setState({
          loading: false,
        });
      });
  }

  getConfigOptions() {
    const { configs } = this.state;
    const options = [
      <option value="" hidden="true">-- choose a configuration --</option>,
    ];

    configs.forEach((object) => {
      options.push(<option value={object.id} key={object.id}>{object.slug}</option>);
    });
    return options;
  }

  render() {
    return (
      <div className="col col-4">
        <Form.Group controlId="samlConfigId">
          <Form.Label htmlFor="samlConfigId">Saml Configuration</Form.Label>
          <Form.Control
            as="select"
            id="samlConfigId"
            name="samlConfigId"
            key={this.state.loading ? 'loaded' : 'loading'}
            defaultValue={this.props.currentConfig}
            data-hj-suppress
          >
            {this.getConfigOptions()}
          </Form.Control>
          <Form.Text>the edX certificates to use with your SAML provider.</Form.Text>
        </Form.Group>
      </div>
    );
  }
}

SamlConfiguration.defaultProps = {
  currentConfig: undefined,
};

SamlConfiguration.propTypes = {
  currentConfig: PropTypes.number,
};

export default SamlConfiguration;

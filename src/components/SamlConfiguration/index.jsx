import React from 'react';
import PropTypes from 'prop-types';
import { ValidationFormGroup, Input } from '@edx/paragon';
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
    const options = [];
    options.push({ label: '-- choose a configuration --', value: '', hidden: true });
    configs.forEach((object) => {
      options.push({ label: object.slug, value: object.id });
    });
    return options;
  }

  render() {
    return (
      <div className="col col-4">
        <ValidationFormGroup
          for="samlConfigId"
          helpText="the edX certificates to use with your SAML provider."
        >
          <label htmlFor="samlConfigId">Saml Configuration</label>

          <Input
            type="select"
            id="samlConfigId"
            name="samlConfigId"
            key={this.state.loading ? 'loaded' : 'loading'}
            options={this.getConfigOptions()}
            defaultValue={this.props.currentConfig}
          />
        </ValidationFormGroup>
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

import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  Form, StatefulButton, Icon,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { snakeCaseFormData } from '../../utils';
import StatusAlert from '../StatusAlert';
import LmsApiService from '../../data/services/LmsApiService';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_CANVAS_CONFIG_FIELDS = [
  'clientId',
  'clientSecret',
  'canvasAccountId',
  'canvasBaseUrl',
];

const CANVAS_FIELDS = [
  {
    key: 'clientId',
    invalidMessage: 'Required. Client Id must not be blank',
    label: 'API Client Id',
  },
  {
    key: 'clientSecret',
    invalidMessage: 'Required. Client Secret must not be blank',
    label: 'API Client Secret',
  },
  {
    key: 'canvasAccountId',
    invalidMessage: 'Required. Canvas Account Id must not be blank',
    label: 'Canvas Account Id',
  },
  {
    key: 'canvasBaseUrl',
    invalidMessage: 'Required. Canvas Base URL must not be blank',
    label: 'Canvas Base URL',
  },
];
class CanvasIntegrationConfigForm extends React.Component {
  state = {
    invalidFields: {},
    submitState: SUBMIT_STATES.DEFAULT,
    active: this.props.config?.active,
    error: undefined,
  };

  createCanvasConfig = async (formData) => {
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LmsApiService.postNewCanvasConfig(transformedData);
      this.setState({
        config: response.data,
        error: undefined,
      });
      return undefined;
    } catch (error) {
      return handleErrors(error);
    }
  }

  updateCanvasConfig = async (formData, uuid) => {
    const transformedData = snakeCaseFormData(formData);
    try {
      const response = await LmsApiService.updateCanvasConfig(transformedData, uuid);
      this.setState({
        config: response.data,
        error: undefined,
      });
      return undefined;
    } catch (error) {
      return handleErrors(error);
    }
  }

  handleSubmit = async (formData, config) => {
    await this.setState({ submitState: SUBMIT_STATES.PENDING, error: null, invalidFields: {} });
    const invalidFields = validateLmsConfigForm(formData, REQUIRED_CANVAS_CONFIG_FIELDS);
    if (!isEmpty(invalidFields)) {
      this.setState({
        invalidFields: {
          ...invalidFields,
        },
        submitState: SUBMIT_STATES.DEFAULT,
      });
      return;
    }

    formData.append('enterprise_customer', this.props.enterpriseId);
    let err;
    if (config) {
      err = await this.updateCanvasConfig(formData, config.id);
    } else {
      err = await this.createCanvasConfig(formData);
    }
    if (err) {
      this.setState({
        submitState: SUBMIT_STATES.ERROR,
        error: err,
      });
      return;
    }
    this.setState({ submitState: SUBMIT_STATES.COMPLETE });
  }

  render() {
    const {
      invalidFields,
      submitState,
      active,
      error,
    } = this.state;
    const { config } = this.props;

    let errorAlert;
    if (error) {
      errorAlert = (
        <div className="form-group is-invalid align-items-left">
          <StatusAlert
            alertType="danger"
            iconClassName="fa fa-times-circle"
            title="Unable to submit config form:"
            message={error}
          />
        </div>
      );
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          this.handleSubmit(formData, this.state.config ? this.state.config : config);
        }}
        onChange={() => this.setState({ submitState: SUBMIT_STATES.DEFAULT })}
      >
        <div className="row">
          <div className="col col-6">
            <Form.Group controlId="active">
              <Form.Checkbox
                name="active"
                checked={active}
                onChange={() => this.setState(prevState => ({ active: !prevState.active }))}
                floatLabelLeft
              >
                Active
              </Form.Checkbox>
            </Form.Group>
          </div>
        </div>
        {CANVAS_FIELDS.map(canvasField => (
          <div className="row" key={canvasField.key}>
            <div className="col col-4">
              <Form.Group
                controlId={canvasField.key}
                isInvalid={invalidFields[canvasField.key]}
              >
                <Form.Label>{canvasField.label}</Form.Label>
                <Form.Control
                  type="text"
                  name={canvasField.key}
                  defaultValue={config ? config[canvasField.key] : ''}
                  onChange={() => this.setState(
                    prevState => ({ [canvasField.key]: !prevState[canvasField.key] }),
                  )}
                  data-hj-suppress
                />
                {invalidFields[canvasField.key] && canvasField.invalidMessage && (
                  <Form.Control.Feedback icon={<Error className="mr-1" />}>
                    {canvasField.invalidMessage}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </div>
          </div>
        ))}

        <div className="row">
          <div className="col col-2">
            <StatefulButton
              state={submitState}
              type="submit"
              id="submitButton"
              labels={{
                default: 'Submit',
                pending: 'Saving...',
                complete: 'Complete',
                error: 'Error',
              }}
              icons={{
                default: <Icon className="fa fa-download" />,
                pending: <Icon className="fa fa-spinner fa-spin" />,
                complete: <Icon className="fa fa-check" />,
                error: <Icon className="fa fa-times" />,
              }}
              disabledStates={[SUBMIT_STATES.PENDING]}
              variant="primary"
              className="ml-3 col"
            />
          </div>
        </div>
        <div className="row">
          <div className="col col-3 mt-3">
            {errorAlert}
          </div>
        </div>
      </form>
    );
  }
}

CanvasIntegrationConfigForm.defaultProps = {
  config: null,
  enterpriseId: null,
};

CanvasIntegrationConfigForm.propTypes = {
  config: PropTypes.shape({
    clientId: PropTypes.string,
    clientSecret: PropTypes.string,
    canvasAccountId: PropTypes.number,
    canvasBaseUrl: PropTypes.string,
    active: PropTypes.bool,
  }),
  enterpriseId: PropTypes.string,
};

export default CanvasIntegrationConfigForm;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  ValidationFormGroup, Input, StatefulButton, Icon, Alert,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_DEGREED_CONFIG_FIELDS = [
  'degreedBaseUrl',
  'degreedUserId',
  'degreedUserPassword',
  'secret',
  'degreedCompanyId',
  'key',
];

function configFormReducer(state, action) {
  switch (action.type) {
    case 'PENDING': {
      return { ...state, error: null, submitState: SUBMIT_STATES.PENDING };
    }
    case 'ERROR': {
      return { ...state, error: action.value, submitState: SUBMIT_STATES.ERROR };
    }
    case 'INVALID': {
      return {
        ...state,
        submitState: SUBMIT_STATES.ERROR,
        invalidFields: action.value,
        error: 'Form could not be submitted as there are fields with invalid values. Please correct them below.',
      };
    }
    case 'COMPLETE': {
      return {
        ...state,
        invalidFields: {},
        error: null,
        submitState: SUBMIT_STATES.COMPLETE,
      };
    }
    case 'SET_CONFIG': {
      return {
        ...state,
        config: action.value,
      };
    }
    case 'BASE_SUBMIT': {
      return {
        ...state,
        submitState: SUBMIT_STATES.DEFAULT,
      };
    }
    default: {
      return { state };
    }
  }
}

function DegreedIntegrationConfigForm({ enterpriseId, config }) {
  const [state, dispatch] = React.useReducer(
    configFormReducer,
    {
      submitState: SUBMIT_STATES.default,
      error: null,
      config: null,
      invalidFields: {},
    },
  );
  const [active, setActive] = useState(config?.active);

  /**
   * Creates a new third party provider configuration, then updates this list with the response.
   * Returns if there is an error.
   * @param {FormData} formData
   */
  const createDegreedConfig = async formData => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', enterpriseId);
    try {
      const response = await LmsApiService.postNewDegreedConfig(transformedData);
      return dispatch({
        type: 'SET_CONFIG',
        value: response.data,
      });
    } catch (error) {
      return handleErrors(error);
    }
  };

  const updateDegreedConfig = async (formData, configId) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', enterpriseId);
    try {
      const response = await LmsApiService.updateDegreedConfig(transformedData, configId);
      return dispatch({
        type: 'SET_CONFIG',
        value: response.data,
      });
    } catch (error) {
      return handleErrors(error);
    }
  };

  /**
  * attempt to submit the form data and show any error states or invalid fields.
  * @param {FormData} formData
  */
  const handleSubmit = async (formData, existingConfig) => {
    dispatch({
      type: 'PENDING',
    });
    // validate the form
    const invalidFields = validateLmsConfigForm(formData, REQUIRED_DEGREED_CONFIG_FIELDS);
    if (!isEmpty(invalidFields)) {
      dispatch({
        type: 'INVALID',
        value: invalidFields,
      });
      return;
    }

    if (existingConfig) {
      const err = await updateDegreedConfig(formData, existingConfig.id);
      if (err) {
        dispatch({
          type: 'ERROR',
          value: err,
        });
      } else {
        dispatch({
          type: 'COMPLETE',
        });
      }
    } else {
      // ...or create a new configuration
      const err = await createDegreedConfig(formData);

      if (err) {
        dispatch({
          type: 'ERROR',
          value: err,
        });
      } else {
        dispatch({
          type: 'COMPLETE',
        });
      }
    }
  };

  let errorAlert;
  if (state.error) {
    errorAlert = (
      <div className="form-group is-invalid align-items-left">
        <Alert
          variant="danger"
          icon={Error}
          dismissible
        >
          <Alert.Heading>Unable to submit config form:</Alert.Heading>
          <p>{state.error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        handleSubmit(formData, state.config || config);
      }}
      onChange={() => dispatch({ type: 'BASE_SUBMIT' })}
    >
      <div className="row">
        <div className="col col-3 mt-3">
          {errorAlert}
        </div>
      </div>
      <div className="row">
        <div className="col col-6">
          <ValidationFormGroup
            for="active"
          >
            <label htmlFor="active">Active</label>
            <Input
              type="checkbox"
              id="active"
              name="active"
              className="ml-3"
              checked={active}
              onChange={() => setActive(prevActive => (!prevActive))}
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <ValidationFormGroup
            for="degreedCompanyId"
            invalid={state.invalidFields.degreedCompanyId}
            invalidMessage="Degreed Organization Code is required."
            helpText="The organization code provided to you by Degreed."
          >
            <label htmlFor="degreedCompanyId">Degreed Organization Code</label>
            <Input
              type="text"
              id="degreedCompanyId"
              name="degreedCompanyId"
              defaultValue={config ? config.degreedCompanyId : null}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <ValidationFormGroup
            for="degreedBaseUrl"
            invalid={state.invalidFields.degreedBaseUrl}
            invalidMessage="Degreed Instance URL is required."
            helpText="Your Degreed instance URL. Make sure to include the protocol (ie https/http)"
          >
            <label htmlFor="degreedBaseUrl">Degreed Instance URL</label>
            <Input
              type="text"
              id="degreedBaseUrl"
              name="degreedBaseUrl"
              defaultValue={config ? config.degreedBaseUrl : null}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <ValidationFormGroup
            for="key"
            invalid={state.invalidFields.key}
            invalidMessage="Degreed API Client ID required."
            helpText="The API Client ID used to make calls to Degreed on behalf of the customer."
          >
            <label htmlFor="key">API Client ID</label>
            <Input
              type="text"
              id="key"
              name="key"
              defaultValue={config ? config.key : null}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <ValidationFormGroup
            for="secret"
            invalid={state.invalidFields.secret}
            invalidMessage="Degreed API Client Secret required."
            helpText="The API Client Secret used to make calls to Degreed on behalf of the customer."
          >
            <label htmlFor="secret">API Client Secret</label>
            <Input
              type="password"
              id="secret"
              name="secret"
              defaultValue={config ? config.secret : null}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <ValidationFormGroup
            for="degreedUserId"
            invalid={state.invalidFields.degreedUserId}
            invalidMessage="The Degreed User ID is required to access Degreed via Oauth."
            helpText="The Degreed User ID provided to the content provider by Degreed."
          >
            <label htmlFor="degreedUserId">Degreed User ID</label>
            <Input
              type="text"
              id="degreedUserId"
              name="degreedUserId"
              defaultValue={config ? config.degreedUserId : null}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <ValidationFormGroup
            for="degreedUserPassword"
            invalid={state.invalidFields.degreedUserPassword}
            invalidMessage="The Degreed User Password is required to access Degreed via Oauth."
            helpText="The Degreed User Password provided to the content provider by Degreed."
          >
            <label htmlFor="degreedUserPassword">Degreed User Password</label>
            <Input
              type="password"
              id="degreedUserPassword"
              name="degreedUserPassword"
              defaultValue={config ? config.degreedUserPassword : null}
              data-hj-suppress
            />
          </ValidationFormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col col-2">
          <StatefulButton
            state={state.submitState}
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
    </form>
  );
}

DegreedIntegrationConfigForm.defaultProps = {
  config: null,
};

DegreedIntegrationConfigForm.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  config: PropTypes.shape({
    active: PropTypes.bool,
    degreedBaseUrl: PropTypes.string,
    degreedCompanyId: PropTypes.string,
    degreedUserId: PropTypes.string,
    degreedUserPassword: PropTypes.string,
    key: PropTypes.string,
    secret: PropTypes.string,
  }),
};

export default DegreedIntegrationConfigForm;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  Form, StatefulButton, Icon,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { snakeCaseFormData } from '../../utils';
import LmsApiService from '../../data/services/LmsApiService';
import StatusAlert from '../StatusAlert';
import SUBMIT_STATES from '../../data/constants/formSubmissions';
import { handleErrors, validateLmsConfigForm } from './common';

export const REQUIRED_CORNERSTONE_CONFIG_FIELDS = [
  'cornerstoneBaseUrl',
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

function CornerstoneIntegrationConfigForm({ enterpriseId, config }) {
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
  const createCornerstoneConfig = async formData => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', enterpriseId);
    try {
      const response = await LmsApiService.postNewCornerstoneConfig(transformedData);
      return dispatch({
        type: 'SET_CONFIG',
        value: response.data,
      });
    } catch (error) {
      return handleErrors(error);
    }
  };

  const updateCornerstoneConfig = async (formData, configId) => {
    const transformedData = snakeCaseFormData(formData);
    transformedData.append('enterprise_customer', enterpriseId);
    try {
      const response = await LmsApiService.updateCornerstoneConfig(transformedData, configId);
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
    const invalidFields = validateLmsConfigForm(formData, REQUIRED_CORNERSTONE_CONFIG_FIELDS);
    if (!isEmpty(invalidFields)) {
      dispatch({
        type: 'INVALID',
        value: invalidFields,
      });
      return;
    }

    if (existingConfig) {
      const err = await updateCornerstoneConfig(formData, existingConfig.id);
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
      const err = await createCornerstoneConfig(formData);

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
        <StatusAlert
          alertType="danger"
          iconClassName="fa fa-times-circle"
          title="Unable to submit config form:"
          message={state.error}
          dismissible
        />
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
          <Form.Label htmlFor="active">Active</Form.Label>
          <Form.Checkbox
            id="active"
            name="active"
            className="ml-3"
            checked={active}
            onChange={() => setActive(prevActive => (!prevActive))}
            isInline
          />
        </div>
      </div>
      <div className="row">
        <div className="col col-4">
          <Form.Group
            controlId="cornerstoneBaseUrl"
            isInvalid={state.invalidFields.cornerstoneBaseUrl}
          >
            <label htmlFor="cornerstoneBaseUrl">Cornerstone Instance URL</label>
            <Form.Control
              type="text"
              id="cornerstoneBaseUrl"
              name="cornerstoneBaseUrl"
              defaultValue={config ? config.cornerstoneBaseUrl : null}
              data-hj-suppress
            />
            <Form.Text>Your Cornerstone instance URL. Make sure to include the protocol (ie https/http)</Form.Text>
            {state.invalidFields.cornerstoneBaseUrl && (
              <Form.Control.Feedback icon={<Error className="mr-1" />}>
                Cornerstone Instance URL is required.
              </Form.Control.Feedback>
            )}
          </Form.Group>
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

CornerstoneIntegrationConfigForm.defaultProps = {
  config: null,
};

CornerstoneIntegrationConfigForm.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  config: PropTypes.shape({
    active: PropTypes.bool,
    cornerstoneBaseUrl: PropTypes.string,
  }),
};

export default CornerstoneIntegrationConfigForm;

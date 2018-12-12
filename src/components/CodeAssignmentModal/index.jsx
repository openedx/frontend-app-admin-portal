import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import classNames from 'classnames';
import { Button, Icon, Modal } from '@edx/paragon';

import BulkAssignFields from './BulkAssignFields';
import EMAIL_TEMPLATE from './EmailTemplate';
import IndividualAssignFields from './IndividualAssignFields';
import TextAreaAutoSize from './TextAreaAutoSize';
import StatusAlert from '../StatusAlert';

import { isRequired } from '../../utils';

import './CodeAssignmentModal.scss';

const FORM_NAME = 'code-assignment-modal-form';

class CodeAssignmentModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  componentDidMount() {
    if (this.props.isOpen) {
      this.setState({ // eslint-disable-line react/no-did-mount-set-state
        isOpen: true,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { submitSucceeded } = this.props;

    if (submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        isOpen: false,
      });
    }
  }

  hasIndividualAssignData() {
    const { data } = this.props;
    return ['code', 'remainingUses'].every(key => key in data);
  }

  renderBody() {
    const {
      data,
      isBulkAssign,
      handleSubmit,
      submitFailed,
      error,
    } = this.props;

    return (
      <React.Fragment>
        {submitFailed && error && this.renderErrorMessage()}
        <div className="assignment-details mb-4">
          {isBulkAssign && data.unassignedCodes && (
            <p>
              <span className="detail-label mr-1">Unassigned Codes:</span>
              {data.unassignedCodes}
            </p>
          )}

          {!isBulkAssign && this.hasIndividualAssignData() && (
            <React.Fragment>
              <p>Code: {data.code}</p>
              <p>Remaining Uses: {data.remainingUses}</p>
            </React.Fragment>
          )}
        </div>
        <form
          className={classNames({ bulk: isBulkAssign })}
          onSubmit={handleSubmit}
        >
          {isBulkAssign && <BulkAssignFields />}
          {!isBulkAssign && <IndividualAssignFields />}

          <div className="mt-4">
            <h3>Email</h3>
            <Field
              id="email-template"
              name="email-template"
              component={TextAreaAutoSize}
              label={
                <React.Fragment>
                  Customize Message
                  <span className="required">*</span>
                </React.Fragment>
              }
              validate={[isRequired]}
              required
            />
          </div>
        </form>
      </React.Fragment>
    );
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassNames={['fa', 'fa-times-circle']}
        message="[insert error message]"
      />
    );
  }

  renderTitle() {
    const { title } = this.props;

    return (
      <React.Fragment>
        <span className="d-block">{title}</span>
        <small>Code Assignment</small>
      </React.Fragment>
    );
  }

  render() {
    const { isOpen } = this.state;
    const {
      isBulkAssign,
      onClose,
      submit,
      submitting,
      invalid,
    } = this.props;

    return (
      <React.Fragment>
        <Modal
          title={this.renderTitle()}
          body={this.renderBody()}
          open={isOpen}
          onClose={onClose}
          buttons={[
            <Button
              label={
                <React.Fragment>
                  {submitting && <Icon className={['fa', 'fa-spinner', 'fa-spin', 'mr-2']} />}
                  {`Assign ${isBulkAssign ? 'Codes' : 'Code'}`}
                </React.Fragment>
              }
              disabled={invalid || submitting}
              buttonType="primary"
              onClick={() => submit(FORM_NAME)}
            />,
          ]}
        />
      </React.Fragment>
    );
  }
}

CodeAssignmentModal.defaultProps = {
  error: null,
  isBulkAssign: false,
  isOpen: false,
  data: {},
};

CodeAssignmentModal.propTypes = {
  // props From redux-form
  handleSubmit: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Error),

  // custom props
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isBulkAssign: PropTypes.bool,
  isOpen: PropTypes.bool,
  data: PropTypes.shape({}),
};

export default reduxForm({
  form: FORM_NAME,
  initialValues: {
    'email-template': EMAIL_TEMPLATE,
  },
})(CodeAssignmentModal);

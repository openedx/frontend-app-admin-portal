import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Button, Icon, Modal } from '@edx/paragon';

import H3 from '../H3';
import BulkAssignFields from './BulkAssignFields';
import IndividualAssignFields from './IndividualAssignFields';
import TextAreaAutoSize from './TextAreaAutoSize';
import StatusAlert from '../StatusAlert';

import emailTemplate from './emailTemplate';
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
    const { submitSucceeded, onClose } = this.props;

    if (submitSucceeded && submitSucceeded !== prevProps.submitSucceeded) {
      onClose();
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
      submitFailed,
      error,
      handleSubmit,
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
        <form onSubmit={handleSubmit}>
          {isBulkAssign && <BulkAssignFields />}
          {!isBulkAssign && <IndividualAssignFields />}

          <div className="mt-4">
            <H3>Email Template</H3>
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
    const { error: { message } } = this.props;

    return (
      <StatusAlert
        alertType="danger"
        iconClassNames={['fa', 'fa-times-circle']}
        title="Unable to assign codes"
        message={`Try refreshing your screen (${message})`}
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
      submitting,
      invalid,
      submit,
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
              onClick={submit}
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
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired,
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
    'email-template': emailTemplate,
  },
})(CodeAssignmentModal);

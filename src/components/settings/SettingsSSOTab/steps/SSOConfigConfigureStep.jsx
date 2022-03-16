import { Form, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import { HELP_CENTER_SAML_LINK } from '../../data/constants';

const SSOFormControl = ({
  label, floatingLabel, defaultValue, onChange, readOnly,
}) => {
  const labelNoSpaces = label.replace(/ /g, '');
  return (
    <>
      <Form.Control
        readOnly={readOnly}
        className="mt-4 mb-1"
        type="text"
        onChange={onChange}
        floatingLabel={floatingLabel || label}
        defaultValue={defaultValue}
        aria-labelledby={labelNoSpaces}
      />
      <Form.Label id={`sso-field-${labelNoSpaces}`} className="mb-2">
        {label}
      </Form.Label>
    </>
  );
};

SSOFormControl.defaultProps = {
  floatingLabel: '',
  readOnly: false,
};

SSOFormControl.propTypes = {
  label: PropTypes.string.isRequired,
  floatingLabel: PropTypes.string,
  defaultValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

const SSOConfigConfigureStep = () => {
  const data = {
    userId: '',
    fullName: '',
    firstName: '',
    maxSessionLength: undefined,
    emailAddress: '',
    samlConfig: '',
  };
  const handleUpdate = itemName => event => {
    console.log(`updating ${ itemName } with ${ event.target.value} from ${data[itemName]}`);
  };
  return (
    <>
      <p>Next, enter additional information to customize SAML attributes if needed.
        We by default expect attributes as documented at the
        {' '}<Hyperlink destination={HELP_CENTER_SAML_LINK} target="_blank">Help Center</Hyperlink> article
      </p>
      <div className="py-4">
        <Form.Group>
          <SSOFormControl
            label={`Setting this option will limit users session lenght to the set value.
                   If set to 0 (zero), the session will expire upon the user closing their browser.
                   If left blank, the Django platform session default length will be used.
            `}
            floatingLabel="Maximum Session Length (seconds)"
            defaultValue={data.maxSessionLength}
            onChange={handleUpdate('maxSessionLength')}
          />
          <SSOFormControl
            label="URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default."
            floatingLabel="User ID Attribute"
            defaultValue={data.userId}
            onChange={handleUpdate('userId')}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user&apos;s full name. Leave blank for default."
            floatingLabel="Full Name Attribute"
            defaultValue={data.fullName}
            onChange={handleUpdate('fullName')}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user&apos;s first name. Leave blank for default."
            floatingLabel="First Name Attribute"
            defaultValue={data.firstName}
            onChange={handleUpdate('firstName')}
          />
          <SSOFormControl
            label="URN of SAML attribute containing the user's email address[es]. Leave blank for default."
            floatingLabel="Email Address Attribute"
            defaultValue={data.emailAddress}
            onChange={handleUpdate('emailAddress')}
          />
          <SSOFormControl
            label="Create a name for your configuration for easy navigation. Leave blank for default."
            floatingLabel="SSO Configuration Name"
            defaultValue={data.displayName}
            onChange={handleUpdate('displayName')}
          />
          <SSOFormControl
            label="We use the default SAML certificate for all configurations"
            floatingLabel="SAML configuration"
            defaultValue={data.samlConfig}
            onChange={handleUpdate('samlConfig')}
            readOnly
          />
        </Form.Group>
      </div>
    </>
  );
};

export default SSOConfigConfigureStep;

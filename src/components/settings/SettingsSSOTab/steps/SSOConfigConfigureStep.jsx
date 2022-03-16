import { Form, Hyperlink } from '@edx/paragon';
import { HELP_CENTER_SAML_LINK } from '../../data/constants';

const SSOConfigConfigureStep = () => {
  const data = {
    userId: '',
    fullName: '',
    firstName: '',
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
          <Form.Control
            className="mt-4 mb-1"
            type="text"
            onChange={handleUpdate('userId')}
            floatingLabel="User ID Attribute"
            defaultValue={data.userId}
            aria-labelledby="sso-userid"
          />
          <Form.Label id="sso-userid" className="mb-2">
            URN of the SAML attribute that we can use as a unique, persistent user ID. Leave blank for default.
          </Form.Label>

          <Form.Control
            className="mt-4 mb-1"
            type="text"
            onChange={handleUpdate('fullName')}
            floatingLabel="Full Name Attribute"
            defaultValue={data.fullName}
            aria-labelledby="sso-full-name"
          />
          <Form.Label id="sso-full-name" className="mb-2">
            URN of SAML attribute containing the user&apos;s full name. Leave blank for default.
          </Form.Label>

          <Form.Control
            className="mt-4 mb-1"
            type="text"
            onChange={handleUpdate('firstName')}
            floatingLabel="First Name Attribute"
            defaultValue={data.firstName}
            aria-labelledby="sso-first-name"
          />
          <Form.Label id="sso-first-name" className="mb-2">
            URN of SAML attribute containing the user&apos;s first name. Leave blank for default.
          </Form.Label>
        </Form.Group>
      </div>
    </>
  );
};

export default SSOConfigConfigureStep;

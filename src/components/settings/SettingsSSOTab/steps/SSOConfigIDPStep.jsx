import { Form } from '@edx/paragon';
import { useContext } from 'react';
import { updateIdpEntryTypeAction, updateIdpMetadataURLAction } from '../data/actions';
import { SSOConfigContext } from '../SSOConfigContext';

const SSOConfigIDPStep = () => {
  const { ssoState, dispatchSsoState } = useContext(SSOConfigContext);
  const { idp: { entryType, metadataURL } } = ssoState;
  const handleMetadataURLChange = event => dispatchSsoState(updateIdpMetadataURLAction(event.target.value));
  const handleMetadataUpdate = event => dispatchSsoState(updateIdpEntryTypeAction(event.target.value));
  const TITLE = 'First, select the way to provide your Identity Provider Metadata and fill out the corresponding fields. ';

  return (
    <>
      <span>{TITLE}</span>
      <div className="mt-4">
        <Form.Group>
          <Form.RadioSet
            name="metadataFetchMethod"
            onChange={handleMetadataUpdate}
            value={entryType}
          >
            <Form.Radio className="mb-3" value="url" placeholder="">Provide URL</Form.Radio>
            <Form.Control
              className="sso-create-form-control mb-4"
              type="text"
              onChange={handleMetadataURLChange}
              floatingLabel="Identity Provider Metadata URL"
              defaultValue={metadataURL}
            />
          </Form.RadioSet>
        </Form.Group>
      </div>

    </>
  );
};

export default SSOConfigIDPStep;

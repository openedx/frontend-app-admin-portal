import { Form } from '@edx/paragon';
import { useIdpMetadataURL } from '../hooks';

const SSOConfigIDPStep = () => {
  const {
    metadataURL, entryType, handleMetadataURLUpdate, handleMetadataEntryTypeUpdate,
  } = useIdpMetadataURL();

  const TITLE = 'First, select the way to provide your Identity Provider Metadata and fill out the corresponding fields. ';

  return (
    <>
      <span>{TITLE}</span>
      <div className="mt-4">
        <Form.Group>
          <Form.RadioSet
            name="metadataFetchMethod"
            onChange={handleMetadataEntryTypeUpdate}
            value={entryType}
          >
            <Form.Radio className="mb-3" value="url" placeholder="">Provide URL</Form.Radio>
            <Form.Control
              className="sso-create-form-control mb-4"
              type="text"
              onChange={handleMetadataURLUpdate}
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

import { Form } from '@edx/paragon';
import { useIdpState } from '../hooks';

/**
 * This step will opt user to enter one of these options:
 * 1: metadata url for IDP. In this case we want to read the metadata from the file directly.
 *    this is done in the backend. However, in this case, we don't yet know the entityId unless we read the file
 *    therefore, we want the user to also enter their entityID
 */
const SSOConfigIDPStep = () => {
  const {
    metadataURL, entryType, entityID,
    handleMetadataURLUpdate, handleMetadataEntryTypeUpdate, handleEntityIDUpdate,
  } = useIdpState();

  const TITLE = 'First, select the method to provide your Identity Provider Metadata and fill out the corresponding fields. ';

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
            <Form.Control
              className="sso-create-form-control mt-4 mb-4"
              type="text"
              onChange={handleEntityIDUpdate}
              floatingLabel="Identity Provider EntityID"
              defaultValue={entityID}
            />
          </Form.RadioSet>
        </Form.Group>
      </div>

    </>
  );
};

export default SSOConfigIDPStep;

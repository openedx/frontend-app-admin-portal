import { Form } from '@edx/paragon';
import { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIdpState } from '../hooks';
import { SSOConfigContext } from '../SSOConfigContext';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * This step will opt user to enter one of these options:
 * 1: metadata url for IDP. In this case we want to read the metadata from the file directly.
 *    this is done in the backend. However, in this case, we don't yet know the entityId unless we read the file
 *    therefore, we want the user to also enter their entityID
 */
const SSOConfigIDPStep = ({
  enterpriseId,
  setExistingIdpDataEntityId,
  setExistingIdpDataId,
  setExistingMetadataUrl,
}) => {
  const {
    metadataURL, entryType, entityID, publicKey, ssoUrl,
    handleMetadataURLUpdate, handleMetadataEntryTypeUpdate, handleEntityIDUpdate,
    handlePublicKeyUpdate, handleSsoUrlUpdate,
  } = useIdpState();

  const { setCurrentError, ssoState } = useContext(SSOConfigContext);
  const { currentStep } = ssoState;

  const onIdpStep = currentStep === 'idp';

  useEffect(() => {
    setExistingMetadataUrl(metadataURL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const response = await LmsApiService.getProviderData(enterpriseId);
      return response.data.results[0];
    };
    fetchData().then(config => {
      if (isMounted) {
        handleEntityIDUpdate({ target: { value: config.entity_id } });
        handlePublicKeyUpdate({ target: { value: config.public_key } });
        handleSsoUrlUpdate({ target: { value: config.sso_url } });
        setExistingIdpDataEntityId(config.entity_id);
        setExistingIdpDataId(config.id);
      }
    }).catch(err => {
      if (err.customAttributes?.httpErrorStatus !== 404) {
        setCurrentError(`: Failed to fetch provider data config. Server responded with: ${err}`);
      } else {
        handleEntityIDUpdate({ target: { value: undefined } });
        handlePublicKeyUpdate({ target: { value: undefined } });
        handleSsoUrlUpdate({ target: { value: undefined } });
      }
    });
    return () => { isMounted = false; };
  }, [
    onIdpStep,
    handleEntityIDUpdate,
    handlePublicKeyUpdate,
    handleSsoUrlUpdate,
    setCurrentError,
    enterpriseId,
    setExistingIdpDataEntityId,
    setExistingIdpDataId,
    setExistingMetadataUrl,
  ]);

  const TITLE = 'First, select the method to provide your Identity Provider Metadata and fill out the corresponding fields.';

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
            <Form.Radio className="mb-3" value="url">
              Provide URL
            </Form.Radio>
            <Form.Control
              disabled={entryType !== 'url'}
              className="sso-create-form-control mb-0"
              type="text"
              onChange={handleMetadataURLUpdate}
              floatingLabel="Identity Provider Metadata URL"
              value={metadataURL || ''}
            />
            <Form.Control
              data-testid="url-entry-entity-id"
              disabled={entryType !== 'url'}
              className="sso-create-form-control mt-4 mb-4"
              type="text"
              onChange={handleEntityIDUpdate}
              floatingLabel="Identity Provider EntityID"
              value={entityID || ''}
            />
            <p className="mt-0 form-text text-muted">
              You can find the URL in your Identiity Provider portal (on your IDP website?)
            </p>

            <Form.Radio className="mb-3 mt-5" value="direct">
              Input data from a metadata file
            </Form.Radio>
            <Form.Control
              disabled={entryType !== 'direct'}
              className="sso-create-form-control mt-4 mb-4"
              type="text"
              onChange={handleEntityIDUpdate}
              floatingLabel="Identity Provider EntityID"
              value={entityID || ''}
            />
            <Form.Control
              disabled={entryType !== 'direct'}
              className="sso-create-form-control mb-4"
              type="text"
              onChange={handleSsoUrlUpdate}
              floatingLabel="SSO URL"
              value={ssoUrl || ''}
            />
            <Form.Control
              disabled={entryType !== 'direct'}
              className="sso-create-form-control mt-4 mb-4"
              type="text"
              onChange={handlePublicKeyUpdate}
              floatingLabel="X.509 Certificate"
              value={publicKey || ''}
            />
          </Form.RadioSet>
        </Form.Group>
      </div>
    </>
  );
};

SSOConfigIDPStep.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  setExistingIdpDataEntityId: PropTypes.func.isRequired,
  setExistingIdpDataId: PropTypes.func.isRequired,
  setExistingMetadataUrl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigIDPStep);

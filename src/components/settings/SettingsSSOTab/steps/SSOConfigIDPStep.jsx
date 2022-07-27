import { Form } from '@edx/paragon';
import React, { useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIdpState, useExistingProviderData } from '../hooks';
import { SSOConfigContext } from '../SSOConfigContext';

/**
 * This step will opt user to enter one of these options:
 * 1: metadata url for IDP. In this case we want to read the metadata from the file directly.
 *    this is done in the backend. However, in this case, we don't yet know the entityId unless we read the file
 *    therefore, we want the user to also enter their entityID
 */
function SSOConfigIDPStep({ enterpriseId }) {
  const {
    metadataURL, entityID, handleMetadataURLUpdate, handleEntityIDUpdate,
  } = useIdpState();
  const { refreshBool } = useContext(SSOConfigContext);
  const [existingProviderData] = useExistingProviderData(enterpriseId, refreshBool);

  const TITLE = 'First provide your Identity Provider Metadata and fill out the corresponding fields.';

  return (
    <>
      <span>{TITLE}</span>
      <div className="mt-4">
        <Form.Group>
          <Form.Label className="mb-3" value="url">
            Metadata Source Information:
          </Form.Label>
          <Form.Control
            className="sso-create-form-control mb-0"
            type="text"
            onChange={handleMetadataURLUpdate}
            floatingLabel="Identity Provider Metadata URL"
            value={metadataURL || ''}
          />
          <Form.Control
            data-testid="url-entry-entity-id"
            className="sso-create-form-control mt-4 mb-4"
            type="text"
            onChange={handleEntityIDUpdate}
            floatingLabel="Identity Provider EntityID"
            value={entityID || ''}
          />
          <p className="mt-0 form-text text-muted">
            You can find the URL in your Identity Provider portal or on your IDP website.
          </p>
          { existingProviderData.length > 0 && (
            <>
              <span>
                Existing certificate data
              </span>
              <Form.Control
                disabled
                className="sso-create-form-control mt-4 mb-4"
                type="text"
                floatingLabel="Identity Provider EntityID"
                value={existingProviderData[0].entity_id}
              />
              <Form.Control
                disabled
                className="sso-create-form-control mb-4"
                type="text"
                floatingLabel="SSO URL"
                value={existingProviderData[0].sso_url}
              />
              { existingProviderData.map((dataConfig, index) => (
                <React.Fragment key={dataConfig.entity_id + dataConfig.id}>
                  <Form.Control
                    disabled
                    size="lg"
                    as="textarea"
                    className="sso-create-form-control mt-4 mb-4"
                    type="text"
                    floatingLabel={`X.509 Certificate ${index + 1}`}
                    value={dataConfig.public_key}
                  />
                </React.Fragment>
              ))}
            </>
          )}
        </Form.Group>
      </div>
    </>
  );
}

SSOConfigIDPStep.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SSOConfigIDPStep);

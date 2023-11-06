import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Form, Hyperlink, Button, Row,
} from '@edx/paragon';
import { Info, Download } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';
import { createSAMLURLs } from '../utils';
import { SSOConfigContext } from '../SSOConfigContext';
import { setFormFieldAction } from '../../../forms/data/actions';
import { FormFieldValidation, useFormContext } from '../../../forms/FormContext';

export const validations: FormFieldValidation[] = [
  {
    formFieldId: 'confirmAuthorizedEdxServiceProvider',
    validator: (fields) => {
      const ret = !fields.confirmAuthorizedEdxServiceProvider;
      return ret;
    },
  },
];

// TODO: Move with SSOConfigContext
type SSOProviderConfig = {
  slug: string;
};

type SSOState = {
  providerConfig?: SSOProviderConfig;
};

type SSOConfigContextValue = {
  ssoState?: SSOState;
};

const SSOConfigAuthorizeStep = () => {
  const configuration = getConfig();
  const {
    ssoState,
  } = useContext<SSOConfigContextValue>(SSOConfigContext);
  const {
    dispatch,
    formFields,
  } = useFormContext();
  const { enterpriseSlug } = useParams();

  const idpSlug = ssoState?.providerConfig?.slug;
  const learnerPortalEnabled = ssoState?.providerConfig?.slug;

  const { testLink } = createSAMLURLs({
    configuration, idpSlug, enterpriseSlug, learnerPortalEnabled,
  });

  const handleCheck = (event) => {
    dispatch?.(
      setFormFieldAction({ fieldId: 'confirmAuthorizedEdxServiceProvider', value: event.target.checked }),
    );
  };

  return (
    <>
      <h2>Authorize edX as a Service Provider</h2>
      <Alert variant="info" className="mb-4" icon={Info}>
        <h3>Action required in a new window</h3>
        Return to this window after completing the following steps
        in a new window to finish configuring your integration.
      </Alert>
      <hr />
      <p>
        1. Download the edX Service Provider metadata as an XML file:
      </p>
      <Row className="justify-content-center mb-4 ">
        <Button as="a" href={formFields?.spMetadataUrl} target="_blank" rel="noopener noreferrer" variant="primary" iconAfter={Download}>
          edX Service Provider Metadata
        </Button>
      </Row>

      <p>
        2.
        <Hyperlink destination={testLink} target="_blank" rel="noopener noreferrer">
          Launch a new window
        </Hyperlink>
        {' '} and upload the XML file to the list of
        authorized SAML Service Providers on your Identity Provider&apos;s portal or website.
      </p>
      <hr />
      <p>Return to this window and check the box once complete</p>

      <Form.Checkbox className="mt-4" checked={formFields?.confirmAuthorizedEdxServiceProvider} onChange={handleCheck}>
        I have authorized edX as a Service Provider
      </Form.Checkbox>
    </>
  );
};

export default SSOConfigAuthorizeStep;

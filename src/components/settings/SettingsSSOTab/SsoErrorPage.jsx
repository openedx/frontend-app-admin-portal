import React from 'react';
import PropTypes from 'prop-types';

import {
  Container,
  FullscreenModal,
  Image,
  Stack,
} from '@edx/paragon';
import { configuration } from '../../../config';
import { ssoStepperNetworkErrorText, ssoLPNetworkErrorText, HELP_CENTER_SAML_LINK } from '../data/constants';
import cardImage from '../../../data/images/SomethingWentWrong.svg';

const SsoErrorPage = ({
  isOpen,
  stepperError,
}) => {
  const stepperText = stepperError ? ssoStepperNetworkErrorText : ssoLPNetworkErrorText;
  return (
    <FullscreenModal
      isOpen={isOpen}
      variant="error"
      hasCloseButton={false}
      onClose={() => { /* FullscreenModal requires an onClose prop despite hasCloseButton is false */ }}
      title={(
        <Image
          src={configuration.LOGO_URL}
          alt="edX logo title"
        />
      )}
    >
      <Container size="md">
        <Image
          data-testid="sso-network-error-image"
          src={cardImage}
          className="ml-auto mr-auto mt-4 d-flex"
          fluid
          alt="Something went wrong"
        />
        <h1 className="text-center mt-4 mb-4">
          <span className="brand-500 text-danger-500">We&apos;re sorry.{' '}</span>
          &nbsp;Something went wrong.
        </h1>

        <Stack gap={6}>
          <p className="text-center">
            {stepperText}{' '}
            Please close this window and try again in a couple of minutes. If the problem persists, contact enterprise
            customer support.
          </p>
          <p className="text-center">
            Helpful link:{' '}
            <a href={HELP_CENTER_SAML_LINK} target="_blank" rel="noreferrer">Enterprise Help Center: Single Sign-On</a>
          </p>
        </Stack>
      </Container>
    </FullscreenModal>
  );
};

SsoErrorPage.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  stepperError: PropTypes.bool,
};

SsoErrorPage.defaultProps = {
  stepperError: false,
};

export default SsoErrorPage;

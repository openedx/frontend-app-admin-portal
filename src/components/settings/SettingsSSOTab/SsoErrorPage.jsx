import React from 'react';
import PropTypes from 'prop-types';

import {
  Container,
  FullscreenModal,
  Image,
  Stack,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { configuration } from '../../../config';
import { HELP_CENTER_SAML_LINK } from '../data/constants';
import cardImage from '../../../data/images/SomethingWentWrong.svg';

const SsoErrorPage = ({
  isOpen,
  stepperError,
}) => {
  const intl = useIntl();

  return (
    <FullscreenModal
      isOpen={isOpen}
      variant="default"
      hasCloseButton={false}
      onClose={() => { /* FullscreenModal requires an onClose prop despite hasCloseButton is false */ }}
      title={(
        <Image
          src={configuration.LOGO_URL}
          alt={intl.formatMessage({
            id: 'sso.error.logo.title',
            defaultMessage: 'edX logo title',
            description: 'Alt text for the edX logo',
          })}
          className="d-flex sso-error-lms-icon"
        />
      )}
    >
      <Container size="md" className="pl-6 pr-6">
        <Image
          data-testid="sso-network-error-image"
          src={cardImage}
          className="ml-auto mr-auto mt-4 d-flex"
          fluid
          alt={intl.formatMessage({
            id: 'sso.error.image.alt',
            defaultMessage: 'Something went wrong',
            description: 'Alt text for the image displayed when an error occurs',
          })}
        />
        <h1 className="text-center mt-4 mb-4">
          <span className="brand-500 text-danger-500">
            <FormattedMessage
              id="sso.error.title"
              defaultMessage="We're sorry."
              description="Title for the SSO error page"
            />
          </span>
          &nbsp;
          <FormattedMessage
            id="sso.error.subtitle"
            defaultMessage="Something went wrong."
            description="Subtitle for the SSO error page"
          />
        </h1>

        <Stack gap={6}>
          <p className="text-center">
            {
              stepperError ? (
                <FormattedMessage
                  id="sso.error.stepper.network.error.text"
                  defaultMessage="We were unable to configure your SSO due to an internal error."
                  description="Error message displayed when an error occurs during the SSO configuration process"
                />
              ) : (
                <FormattedMessage
                  id="sso.error.lp.network.error.text"
                  defaultMessage="We were unable to load your SSO details due to an internal error."
                  description="Error message displayed when an error occurs while loading the SSO details"
                />
              )
            }
            &npsp;
            <FormattedMessage
              id="sso.error.try.again"
              defaultMessage="Please close this window and try again in a couple of minutes. If the problem persists, contact enterprise customer support."
              description="Message instructing the user to try again after an error"
            />
          </p>
          <p className="text-center">
            <FormattedMessage
              id="sso.error.help.center.saml.link"
              defaultMessage="Helpful link:"
              description="Text for a helpful link"
            /> &nbsp;
            <a href={HELP_CENTER_SAML_LINK} target="_blank" rel="noreferrer">
              <FormattedMessage
                id="sso.error.help.center.saml.link.text"
                defaultMessage="Enterprise Help Center: Single Sign-On"
                description="Text for a helpful link"
              />
            </a>
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

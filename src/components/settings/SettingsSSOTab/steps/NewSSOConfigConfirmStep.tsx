import React from 'react';
import {
  Alert, Hyperlink, OverlayTrigger, Popover,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const IncognitoPopover = () => (
  <OverlayTrigger
    trigger="click"
    key="top"
    placement="top"
    overlay={(
      <Popover id="popover-positioned-top">
        <Popover.Content>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigAuthorizeStep.incognitoPopover"
            defaultMessage="Steps to open a new window in incognito mode (also known as private mode) may vary based on the browser you are using. Review your browser's help documentation as needed."
            description="Popover content for incognito window"
          />
        </Popover.Content>
      </Popover>
      )}
  >
    <Hyperlink>
      <FormattedMessage
        id="adminPortal.settings.ssoConfigAuthorizeStep.incognitoWindow"
        defaultMessage="incognito window"
        description="Link text for opening a new window in incognito mode"
      />
    </Hyperlink>
  </OverlayTrigger>
);

const SSOConfigConfirmStep = () => (
  <>
    <h2>
      <FormattedMessage
        id="adminPortal.settings.ssoConfigConfirmStep.title"
        defaultMessage="Wait for SSO configuration confirmation"
        description="Title for SSO configuration confirmation step"
      />
    </h2>
    <Alert variant="info" className="mb-4" icon={Info}>
      <h3>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigConfirmStep.actionRequired"
          defaultMessage="Action required from email"
          description="Action required message for SSO configuration confirmation"
        />
      </h3>
      <FormattedMessage
        id="adminPortal.settings.ssoConfigConfirmStep.actionRequiredInstructions"
        defaultMessage="Great news! You have completed the configuration steps, edX is actively configuring your SSO connection. You will receive an email within about five minutes when the configuration is complete. The email will include instructions for testing."
        description="Action required instructions for SSO configuration confirmation"
      />
    </Alert>
    <hr />
    <h3>
      <FormattedMessage
        id="adminPortal.settings.ssoConfigConfirmStep.expect"
        defaultMessage="What to expect:"
        description="Header for what to expect section"
      />
    </h3>
    <ul>
      <li>
        <FormattedMessage
          id="adminPortal.settings.ssoConfigConfirmStep.email"
          defaultMessage="An SSO configuration confirmation email."
          description="What to expect: An SSO configuration confirmation email."
        />
      </li>
      <ul>
        <li>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConfirmStep.testingInstructions"
            defaultMessage="Testing instructions involve copying and pasting a custom URL into an"
            description="Instruction on what user can expect in the email"
          /> <IncognitoPopover />
        </li>
        <li>
          <FormattedMessage
            id="adminPortal.settings.ssoConfigConfirmStep.linkBack"
            defaultMessage="A link back to the SSO Settings page"
            description="Instruction on what user can expect in the email"
          />
        </li>
      </ul>
    </ul>
    <hr />
    <p>
      <FormattedMessage
        id="adminPortal.settings.ssoConfigConfirmStep.finish"
        defaultMessage="Select the {finishButtonText} button below or close this form via the {xButtonText} in the upper right corner while you wait for your configuration email. Your SSO testing status will display on the following SSO settings screen."
        description="Instruction to finish SSO configuration"
        values={{
          finishButtonText: <strong>&quot;Finish&quot;</strong>,
          xButtonText: <strong>&quot;X&quot;</strong>,
        }}
      />
    </p>
  </>
);

export default SSOConfigConfirmStep;

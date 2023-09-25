import React from 'react';
import {
  Alert, Hyperlink, OverlayTrigger, Popover,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const IncognitoPopover = () => (
  <OverlayTrigger
    trigger="click"
    key="top"
    placement="top"
    overlay={(
      <Popover id="popover-positioned-top">
        <Popover.Content>
          Steps to open a new window in incognito mode (also known as private mode)
          may vary based on the browser you are using.
          Review your browser&apos;s help documentation as needed.
        </Popover.Content>
      </Popover>
      )}
  >
    <Hyperlink>incognito window</Hyperlink>
  </OverlayTrigger>
);

const SSOConfigConfirmStep = () => (
  <>
    <h2>Wait for SSO configuration confirmation</h2>
    <Alert variant="info" className="mb-4" icon={Info}>
      <h3>Action required from email</h3>
      Great news!  You have completed the configuration steps, edX is actively configuring your SSO connection.
      You will receive an email within about five minutes when the configuration is complete.
      The email will include instructions for testing.
    </Alert>
    <hr />
    <h3>What to expect:</h3>
    <ul>
      <li>SSO configuration confirmation email.</li>
      <ul>
        <li>Testing instructions involve copying and pasting a custom URL into an <IncognitoPopover /> </li>
        <li>A link back to the SSO Settings page</li>
      </ul>
    </ul>
    <hr />
    <p>
      Select the <strong>&quot;Finish&quot;</strong> button below or close this form via the
      <strong>&quot;X&quot;</strong> in the upper right corner while you wait for your
      configuration email.  Your SSO testing status will display on the following SSO settings screen.
    </p>
  </>
);

export default SSOConfigConfirmStep;

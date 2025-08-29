import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ColorContrastChecker from 'color-contrast-checker';
import {
  ActionRow, Button, Form, Hyperlink, Icon, ModalDialog,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import { CUSTOM_THEME_LABEL, HELP_CENTER_BRANDING_LINK } from '../data/constants';
import ColorEntryField from './ColorEntryField';
import { ColorAccessibilityChecker, Theme } from './types';

type CustomThemeModalProps = {
  // Whether modal is open
  isOpen: boolean,
  // Handler for closing the modal
  close: () => void,
  // Existing custom theme
  customColors: Theme | null,
  // Callback for setting theme
  setTheme: (theme: Theme) => void,
};

const CustomThemeModal = ({
  isOpen, close, customColors, setTheme,
}: CustomThemeModalProps) => {
  const [button, setButton] = useState('');
  const [buttonValid, setButtonValid] = useState(false);
  const [buttonWarning, setButtonWarning] = useState(false);
  const [banner, setBanner] = useState('');
  const [bannerValid, setBannerValid] = useState(false);
  const [bannerWarning, setBannerWarning] = useState(false);
  const [accent, setAccent] = useState('');
  const [accentValid, setAccentValid] = useState(false);

  const intl = useIntl();

  const headerText = intl.formatMessage({
    id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.headerText',
    defaultMessage: 'Customize the admin and learner edX experience using your own brand colors. Enter color values in hexadecimal code.',
    description: 'Header text explaining the purpose of the custom theme modal',
  });
  const infoText = intl.formatMessage({
    id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.infoText',
    defaultMessage: 'More details about color appearance in the admin and learner experiences and best practices for selecting accessible colors are available in the ',
    description: 'Informational text about where to find more details on color appearance and best practices',
  });

  const colorContrastChecker = new ColorContrastChecker();
  const a11yChecker = (fontSize: number): ColorAccessibilityChecker => {
    const func = (color, textColor) => !colorContrastChecker.isLevelAA(color, textColor.hex(), fontSize);
    return func;
  };

  const setCustom = () => {
    const CUSTOM_THEME = {
      title: CUSTOM_THEME_LABEL,
      button: (button === '' ? customColors?.button : button),
      banner: (banner === '' ? customColors?.banner : banner),
      accent: (accent === '' ? customColors?.accent : accent),
    } as Theme;
    setTheme(CUSTOM_THEME);
    close();
  };

  return (
    <ModalDialog
      title="My dialog"
      isOpen={isOpen}
      onClose={close}
      size="md"
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage
            id="adminPortal.settings.portalAppearanceTab.customThemeModalTitle"
            defaultMessage="Custom Theme"
            description="Title for the Custom Theme modal"
          />
        </ModalDialog.Title>
        <p className="mt-4">{headerText}</p>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <Form>
          <ColorEntryField
            controlId="custom-button"
            setField={setButton}
            fieldValid={buttonValid}
            fieldWarning={buttonWarning}
            setFieldValid={setButtonValid}
            setFieldWarning={setButtonWarning}
            defaultColor={customColors?.button}
            a11yCheck={a11yChecker(18)}
            floatingLabel={
              intl.formatMessage({
                id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.buttonColor',
                defaultMessage: 'Button color',
                description: 'Label for the button color input field',
              })
            }
          />

          <ColorEntryField
            controlId="custom-banner"
            setField={setBanner}
            fieldValid={bannerValid}
            fieldWarning={bannerWarning}
            setFieldValid={setBannerValid}
            setFieldWarning={setBannerWarning}
            defaultColor={customColors?.banner}
            a11yCheck={a11yChecker(40)}
            floatingLabel={
              intl.formatMessage({
                id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.bannerColor',
                defaultMessage: 'Banner color',
                description: 'Label for the banner color input field',
              })
            }
          />

          <ColorEntryField
            controlId="custom-accent"
            setField={setAccent}
            fieldValid={accentValid}
            setFieldValid={setAccentValid}
            defaultColor={customColors?.accent}
            floatingLabel={
              intl.formatMessage({
                id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.accentColor',
                defaultMessage: 'Accent color',
                description: 'Label for the accent color input field',
              })
            }
          />
        </Form>
        <p className="mt-4 mb-1 d-flex x-small">
          <Icon src={InfoOutline} className="mr-2" /> {infoText}
          <Hyperlink
            destination={HELP_CENTER_BRANDING_LINK}
            style={{ display: 'contents' }}
            target="_blank"
            showLaunchIcon={false}
          >
            {intl.formatMessage({
              id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.helpCenterLink',
              defaultMessage: 'Enterprise Help Center.',
              description: 'Text for the link to the Enterprise Help Center',
            })}
          </Hyperlink>
        </p>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button
            variant="primary"
            onClick={setCustom}
            disabled={!buttonValid || !bannerValid || !accentValid}
          >
            {intl.formatMessage({
              id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.addThemeButton',
              defaultMessage: 'Add theme',
              description: 'Text for the button to add the custom theme',
            })}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

CustomThemeModal.defaultProps = {
  customColors: null,
};

CustomThemeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  customColors: PropTypes.shape({
    title: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
    banner: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }),
  setTheme: PropTypes.func.isRequired,
};

export default CustomThemeModal;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Color from 'color';
import ColorContrastChecker from 'color-contrast-checker';
import {
  ActionRow, Button, Form, Hyperlink, Icon, ModalDialog,
} from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';
import {
  CUSTOM_THEME_LABEL, HELP_CENTER_BRANDING_LINK, DARK_COLOR, WHITE_COLOR,
} from '../data/constants';

const CustomThemeModal = ({
  isOpen, close, customColors, setTheme,
}) => {
  const [button, setButton] = useState('');
  const [buttonValid, setButtonValid] = useState(true);
  const [buttonWarning, setButtonWarning] = useState('');
  const [banner, setBanner] = useState('');
  const [bannerValid, setBannerValid] = useState(true);
  const [bannerWarning, setBannerWarning] = useState('');
  const [accent, setAccent] = useState('');
  const [accentValid, setAccentValid] = useState(true);

  const headerText = 'Customize the admin and learner edX experience using your own brand colors. Enter color values in hexadecimal code.';
  const infoText = 'More details about color appearance in the admin and learner experiences and best practices for selecting accessible colors are available in the ';
  const invalidMessage = 'Must be hexadecimal starting with # (Ex: #1e0b57)';
  const warningMessage = 'Color doesn\'t meet the WCAG AA standard of accessibility. Learn more at the help center link below. ';

  const hexRegExpPattern = '^#([A-Fa-f0-9]{6})$';
  const validHex = new RegExp(hexRegExpPattern);

  const a11yChecker = new ColorContrastChecker();
  const whiteColor = Color(WHITE_COLOR);
  const darkColor = Color(DARK_COLOR);
  const getA11yTextColor = color => (color.isDark() ? whiteColor : darkColor);

  const validateColor = (field, input, setter, warningSetter) => {
    if (!input.match(validHex)) {
      setter(false);
    } else {
      const inputColor = Color(input);
      const textColor = getA11yTextColor(inputColor);
      // checker params -> background, foreground, font size
      if (field === 'button' && !a11yChecker.isLevelAA(input, textColor.hex(), 18)) {
        warningSetter(true);
      } else if (field === 'banner' && !a11yChecker.isLevelAA(input, textColor.hex(), 40)) {
        warningSetter(true);
      }
      setter(true);
    }
  };

  const setCustom = () => {
    const CUSTOM_THEME = {
      title: CUSTOM_THEME_LABEL,
      button: (button === '' ? customColors?.button : button),
      banner: (banner === '' ? customColors?.banner : banner),
      accent: (accent === '' ? customColors?.accent : accent),
    };
    setTheme([CUSTOM_THEME, CUSTOM_THEME]);
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
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {CUSTOM_THEME_LABEL}
        </ModalDialog.Title>
        <p className="mt-4">{headerText}</p>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <Form>
          <Form.Group controlId="custom-button">
            <Form.Control
              floatingLabel="Button color"
              isInvalid={!buttonValid}
              onChange={(e) => {
                setButton(e.target.value);
                validateColor('button', e.target.value, setButtonValid, setButtonWarning);
              }}
              defaultValue={customColors?.button}
            />
            {!buttonValid && (
              <Form.Control.Feedback type="invalid">{invalidMessage}</Form.Control.Feedback>
            )}
            {buttonValid && buttonWarning && (
              <Form.Control.Feedback type="warning">{warningMessage}</Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="custom-banner">
            <Form.Control
              floatingLabel="Banner color"
              isInvalid={!bannerValid}
              onChange={(e) => {
                setBanner(e.target.value);
                validateColor('banner', e.target.value, setBannerValid, setBannerWarning);
              }}
              defaultValue={customColors?.banner}
            />
            {!bannerValid && (
              <Form.Control.Feedback type="invalid">{invalidMessage}</Form.Control.Feedback>
            )}
            {bannerValid && bannerWarning && (
              <Form.Control.Feedback type="warning">{warningMessage}</Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="custom-accent">
            <Form.Control
              floatingLabel="Accent color"
              isInvalid={!accentValid}
              onChange={(e) => {
                setAccent(e.target.value);
                validateColor('accent', e.target.value, setAccentValid, null);
              }}
              defaultValue={customColors?.accent}
            />
            {!accentValid && (<Form.Control.Feedback type="invalid">{invalidMessage}</Form.Control.Feedback>)}
          </Form.Group>
        </Form>
        <p className="mt-4 mb-1 d-flex x-small">
          <Icon src={InfoOutline} className="mr-2" /> {infoText}
          <Hyperlink
            destination={HELP_CENTER_BRANDING_LINK}
            style={{ display: 'contents' }}
            target="_blank"
            showLaunchIcon={false}
          >
            Enterprise Help Center.
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
            Add theme
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

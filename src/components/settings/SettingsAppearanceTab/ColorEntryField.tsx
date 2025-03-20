import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Color from 'color';
import { Form } from '@openedx/paragon';
import {
  DARK_COLOR, WHITE_COLOR,
} from '../data/constants';
import { ColorAccessibilityChecker } from './types';

type ColorEntryFieldProps = {
  // Identifier/key for field
  controlId: string,
  // Label shown in blank field
  floatingLabel: string,
  // Default field color
  defaultColor?: string,
  // Handler for setting field value
  setField: (string) => void,
  // Whether the field is valid
  fieldValid: boolean,
  // Handler for setting field validity
  setFieldValid: (boolean) => void,
  // Whether the field value has an accessibility warning
  fieldWarning?: boolean,
  // Handler for setting the accessibility warning state
  setFieldWarning?: (boolean) => void,
  // Accessibility checker
  a11yCheck?: ColorAccessibilityChecker
};

const ColorEntryField = ({
  controlId,
  floatingLabel,
  setField,
  fieldValid,
  setFieldValid,
  fieldWarning,
  setFieldWarning,
  defaultColor,
  a11yCheck,
}: ColorEntryFieldProps) => {
  const [isTouched, setTouched] = useState(false);

  const hexRegExpPattern = '^#([A-Fa-f0-9]{6})$';
  const validHex = new RegExp(hexRegExpPattern);

  const whiteColor = Color(WHITE_COLOR);
  const darkColor = Color(DARK_COLOR);
  const getA11yTextColor = color => (color.isDark() ? whiteColor : darkColor);

  const intl = useIntl();

  const invalidMessage = intl.formatMessage({
    id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.invalidHex',
    defaultMessage: 'Must be hexadecimal starting with {hash} (Ex: {example})',
    description: 'Error message for invalid hexadecimal input',
  }, { hash: '#', example: '#1e0b57' });
  const warningMessage = intl.formatMessage({
    id: 'adminPortal.settings.portalAppearanceTab.customThemeModal.warningMessage',
    defaultMessage: 'Color does not meet the WCAG AA standard of accessibility. Learn more at the help center link below.',
    description: 'Warning message for colors that dont meet accessibility standards',
  });

  const validateColor = (input, setter, warningSetter) => {
    if (!input.match(validHex)) {
      setter(false);
    } else {
      const inputColor = Color(input);
      const textColor = getA11yTextColor(inputColor);
      // checker params -> background, foreground, font size
      if (a11yCheck?.(input, textColor)) {
        warningSetter?.(true);
      }
      setter(true);
    }
  };

  return (
    <Form.Group controlId={controlId} key={controlId}>
      <Form.Control
        floatingLabel={floatingLabel}
        isInvalid={!fieldValid}
        onChange={(e) => {
          setTouched(true);
          const input = e.target.value;
          setField(input);
          validateColor(input, setFieldValid, setFieldWarning);
        }}
        defaultValue={defaultColor}
      />
      {isTouched && !fieldValid && (
        <Form.Control.Feedback type="invalid">{invalidMessage}</Form.Control.Feedback>
      )}
      {warningMessage && isTouched && fieldValid && fieldWarning && (
        <Form.Control.Feedback type="warning">{warningMessage}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

ColorEntryField.propTypes = {
  controlId: PropTypes.string.isRequired,
  floatingLabel: PropTypes.string.isRequired,
  setField: PropTypes.func.isRequired,
  fieldValid: PropTypes.bool.isRequired,
  setFieldValid: PropTypes.func.isRequired,
  fieldWarning: PropTypes.string.isRequired,
  setFieldWarning: PropTypes.func.isRequired,
  defaultColor: PropTypes.string.isRequired,
  a11yCheck: PropTypes.func.isRequired,
};

export default ColorEntryField;

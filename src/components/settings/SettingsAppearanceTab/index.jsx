import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, CardGrid, Dropzone, Image, Toast, useToggle,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Info } from '@openedx/paragon/icons';

import InfoHover from '../../InfoHover';
import LmsApiService from '../../../data/services/LmsApiService';
import ThemeCard from './ThemeCard';
import CustomThemeModal from './CustomThemeModal';
import {
  ACUMEN_THEME, CAMBRIDGE_THEME, CUSTOM_THEME_LABEL, IMPACT_THEME, PIONEER_THEME, SAGE_THEME, SCHOLAR_THEME,
} from '../data/constants';

export const SettingsAppearanceTab = ({
  enterpriseId, enterpriseBranding, updatePortalConfiguration,
}) => {
  const logoMessage = 'Your logo will appear on the upper left of every page for both learners and administrators. For best results, use a rectagular logo that is longer in width and has a transparent or white background.';
  const themeMessage = 'Select designer curated theme colors to update the look and feel of your learner and administrator experiences, or create your own theme.';
  const [configChangeSuccess, setConfigChangeSuccess] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [customModalIsOpen, openCustomModal, closeCustomModal] = useToggle(false);
  const curatedThemes = [ACUMEN_THEME, CAMBRIDGE_THEME, IMPACT_THEME, PIONEER_THEME, SAGE_THEME, SCHOLAR_THEME];

  function getStartingTheme() {
    for (let i = 0; i < curatedThemes.length; i++) {
      if (curatedThemes[i].button === enterpriseBranding.primary_color
        && curatedThemes[i].banner === enterpriseBranding.secondary_color
        && curatedThemes[i].accent === enterpriseBranding.tertiary_color) {
        return [curatedThemes[i], null];
      }
    }
    const CUSTOM_THEME = {
      title: CUSTOM_THEME_LABEL,
      button: enterpriseBranding.primary_color,
      banner: enterpriseBranding.secondary_color,
      accent: enterpriseBranding.tertiary_color,
    };
    return [CUSTOM_THEME, CUSTOM_THEME];
  }

  // this variable is [selected , null] if the user has not created a custom
  // theme and it is [selectedTheme, [customName, #primary, #secondary, #tertiary]] if they have
  // (they can't be two variables because of rules regarding setting react hooks)
  const [theme, setTheme] = useState(getStartingTheme());

  const handleLogoUpload = async ({
    fileData, handleError,
  }) => {
    try {
      const formData = new FormData();
      formData.append('logo', fileData.get('file'));
      const response = await LmsApiService.updateEnterpriseCustomerBranding(enterpriseId, formData);
      if (response.status === 204) {
        setUploadedFile(fileData.get('file'));
        setConfigChangeSuccess(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const saveChanges = () => {
    const sendThemeData = async (formData) => {
      const response = await LmsApiService.updateEnterpriseCustomerBranding(enterpriseId, formData);
      if (response.status === 204) {
        const updatedBranding = {
          logo: uploadedFile || enterpriseBranding.logo,
          primary_color: theme[0].button,
          secondary_color: theme[0].banner,
          tertiary_color: theme[0].accent,
        };
        updatePortalConfiguration({ enterpriseBranding: updatedBranding });
        setConfigChangeSuccess(true);
      } else {
        setConfigChangeSuccess(false);
      }
    };
    try {
      const formData = new FormData();
      formData.append('primary_color', theme[0].button);
      formData.append('secondary_color', theme[0].banner);
      formData.append('tertiary_color', theme[0].accent);
      sendThemeData(formData);
    } catch {
      setConfigChangeSuccess(false);
    }
  };
  return (
    <>
      <h2 className="py-2">
        <FormattedMessage
          id="adminPortal.settings.portalAppearanceTab.title"
          defaultMessage="Portal Appearance"
          description="Title for the portal appearance section."
        />
      </h2>
      <p>
        <FormattedMessage
          id="adminPortal.settings.portalAppearanceTab.description"
          defaultMessage="Customize the appearance of your learner and administrator edX experiences with your organization{apostrophe}s logo and color themes."
          description="Description for the portal appearance section."
          values={{ apostrophe: "'" }}
        />
      </p>
      <Alert
        show={configChangeSuccess === false}
        variant="danger"
        icon={Info}
        onClose={() => setConfigChangeSuccess(null)}
        dismissible
        stacked
      >
        <Alert.Heading>
          <FormattedMessage
            id="adminPortal.settings.portalAppearanceTab.errorHeading"
            defaultMessage="We{apostrophe}re sorry"
            description="Heading for error alert."
            values={{ apostrophe: "'" }}
          />
        </Alert.Heading>
        <p>
          <FormattedMessage
            id="adminPortal.settings.portalAppearanceTab.errorMessage"
            defaultMessage="Something went wrong behind the scenes. Try again later or contact support for help."
            description="Error message description."
          />
        </p>
      </Alert>
      <h3 className="py-2">
        <FormattedMessage
          id="adminPortal.settings.portalAppearanceTab.logoTitle"
          defaultMessage="Logo"
          description="Title for the logo section."
        />
        <InfoHover className="" keyName="logo-info-hover" message={logoMessage} />
      </h3>
      {!uploadedFile && (
        <Dropzone
          onProcessUpload={handleLogoUpload}
          errorMessages={{
            invalidType: 'Invalid file type, only png images allowed.',
            invalidSize: 'The file size must be under 512 Mb.',
            multipleDragged: 'Cannot upload more than one file.',
          }}
          maxSize={512000}
          accept={{
            'image/*': ['.png'],
          }}
        />
      )}
      {uploadedFile && (
        <p className="image-preview">
          <Image
            src={global.URL.createObjectURL(uploadedFile)}
          />
        </p>
      )}

      <Toast
        onClose={() => setConfigChangeSuccess(null)}
        show={configChangeSuccess || false}
      >
        <FormattedMessage
          id="adminPortal.settings.portalAppearanceTab.successMessage"
          defaultMessage="Portal appearance updated successfully."
          description="Success message for updating portal appearance."
        />
      </Toast>
      <h3 className="py-2 pt-5">
        <FormattedMessage
          id="adminPortal.settings.portalAppearanceTab.themeTitle"
          defaultMessage="Theme"
          description="Title for the theme section."
        />
        <InfoHover className="" keyName="theme-info-hover" message={themeMessage} />
      </h3>
      <CardGrid
        columnSizes={{
          xs: 6,
          lg: 4,
          xl: 3,
        }}
      >
        <ThemeCard themeVars={SCHOLAR_THEME} theme={theme} setTheme={setTheme} />
        <ThemeCard themeVars={SAGE_THEME} theme={theme} setTheme={setTheme} />
        <ThemeCard themeVars={IMPACT_THEME} theme={theme} setTheme={setTheme} />
        <ThemeCard themeVars={CAMBRIDGE_THEME} theme={theme} setTheme={setTheme} />
        <ThemeCard themeVars={ACUMEN_THEME} theme={theme} setTheme={setTheme} />
        <ThemeCard themeVars={PIONEER_THEME} theme={theme} setTheme={setTheme} />
      </CardGrid>
      <h3 className="py-2 pt-5 mb-2">
        {CUSTOM_THEME_LABEL}
      </h3>
      {theme[1] === null && (
        <p className="mt-0">
          <FormattedMessage
            id="adminPortal.settings.portalAppearanceTab.createCustomThemeMessage"
            defaultMessage="Rather use your own colors?"
            description="Message to create a custom theme."
          />
          <Button variant="link" onClick={openCustomModal} className="p-0 pl-1" size="inline">
            <FormattedMessage
              id="adminPortal.settings.portalAppearanceTab.createCustomThemeButton"
              defaultMessage="Create a custom theme."
              description="Button label to create a custom theme."
            />
          </Button>
        </p>
      )}
      {theme[1] !== null && (
        <ThemeCard className="mt-1" themeVars={theme[1]} theme={theme} setTheme={setTheme} openCustom={openCustomModal} />
      )}
      <CustomThemeModal
        isOpen={customModalIsOpen}
        close={closeCustomModal}
        customColors={theme[1]}
        setTheme={setTheme}
      />
      <Button className="d-flex ml-auto" onClick={saveChanges}>
        <FormattedMessage
          id="adminPortal.settings.portalAppearanceTab.saveChangesButton"
          defaultMessage="Save changes"
          description="Button label to save changes."
        />
      </Button>
    </>
  );
};

SettingsAppearanceTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseBranding: PropTypes.shape({
    logo: PropTypes.string,
    primary_color: PropTypes.string,
    secondary_color: PropTypes.string,
    tertiary_color: PropTypes.string,
  }).isRequired,
  updatePortalConfiguration: PropTypes.func.isRequired,
};

export default SettingsAppearanceTab;

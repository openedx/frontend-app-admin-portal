import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, CardGrid, Dropzone, Image, Toast, useToggle,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

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
      <h2 className="py-2">Portal Appearance</h2>
      <p>
        Customize the appearance of your learner and administrator edX experiences with your
        organization’s logo and color themes.
      </p>
      <Alert
        show={configChangeSuccess === false}
        variant="danger"
        icon={Info}
        onClose={() => setConfigChangeSuccess(null)}
        dismissible
        stacked
      >
        <Alert.Heading>We&apos;re sorry</Alert.Heading>
        <p>
          Something went wrong behind the scenes. Try again later or contact support for help.
        </p>
      </Alert>
      <h3 className="py-2">
        Logo
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
        Portal appearance updated successfully.
      </Toast>
      <h3 className="py-2 pt-5">
        Theme
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
        Rather use your own colors?
        <Button variant="link" onClick={openCustomModal} className="p-0 pl-1" size="inline">
          Create a custom theme.
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
      <Button className="d-flex ml-auto" onClick={saveChanges}>Save changes</Button>
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

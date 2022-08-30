import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Dropzone, Toast } from '@edx/paragon';

import InfoHover from '../../InfoHover';
import LmsApiService from '../../../data/services/LmsApiService';
import ThemeCard from './ThemeCard';
import {
  ACUMEN_THEME, CAMBRIDGE_THEME, IMPACT_THEME, PIONEER_THEME, SAGE_THEME, SCHOLAR_THEME,
} from '../data/constants';

export default function SettingsAppearanceTab({
  enterpriseId,
}) {
  const logoMessage = 'Your logo will appear on the upper left of every page for both learners and administrators. For best results, use a rectagular logo that is longer in width and has a transparent or white background.';
  const themeMessage = 'Select designer curated theme colors to update the look and feel of your learner and administrator experiences, or create your own theme.';
  const [configChangeSuccess, setConfigChangeSuccess] = useState(null);
  const [theme, setTheme] = useState(SCHOLAR_THEME);

  async function handleProcessUpload({
    fileData, handleError,
  }) {
    try {
      const response = await LmsApiService.updateEnterpriseCustomerBranding(enterpriseId, fileData);
      if (response.status === 204) {
        setConfigChangeSuccess(true);
      }
    } catch (error) {
      handleError(error);
    }
  }

  // useEffect(() => {
  //   const sendThemeData = async (formData) => {
  //     const response = await LmsApiService.updateEnterpriseCustomerBranding(enterpriseId, formData);
  //     return response;
  //   };
  //   try {
  //     const formData = new FormData();
  //     formData.append('primary_color', theme.banner);
  //     formData.append('secondary_color', theme.button);
  //     formData.append('tertiary_color', theme.accent);
  //     const response = sendThemeData(formData);
  //     if (response.status === 204) {
  //       setConfigChangeSuccess(true);
  //     }
  //   } catch {
  //     setConfigChangeSuccess(false);
  //   }
  // }, [enterpriseId, theme]);

  return (
    <>
      <h2 className="py-2">Portal Appearance</h2>
      <p>
        Customize the appearance of your learner and administrator edX experiences with your
        organization’s logo and color themes.
      </p>
      <h3 className="py-2">
        Logo
        <InfoHover className="" keyName="logo-info-hover" message={logoMessage} />
      </h3>
      <Dropzone
        onProcessUpload={handleProcessUpload}
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
      <Toast
        onClose={() => setConfigChangeSuccess(false)}
        show={configChangeSuccess}
      >
        Branding configuration successfully.
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
        <ThemeCard themeVars={SCHOLAR_THEME} selected={theme} setTheme={setTheme} />
        <ThemeCard themeVars={SAGE_THEME} selected={theme} setTheme={setTheme} />
        <ThemeCard themeVars={IMPACT_THEME} selected={theme} setTheme={setTheme} />
        <ThemeCard themeVars={CAMBRIDGE_THEME} selected={theme} setTheme={setTheme} />
        <ThemeCard themeVars={ACUMEN_THEME} selected={theme} setTheme={setTheme} />
        <ThemeCard themeVars={PIONEER_THEME} selected={theme} setTheme={setTheme} />
      </CardGrid>
    </>
  );
}

SettingsAppearanceTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import Color from 'color';

import { useParams } from 'react-router-dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { isDefinedAndNotNull, isDefined } from '../../../utils';
import { DARK_COLOR, WHITE_COLOR, SETTINGS_TAB_PARAM } from './constants';
import LmsApiService from '../../../data/services/LmsApiService';

const COLOR_LIGHTEN_DARKEN_MODIFIER = 0.2;
const COLOR_MIX_MODIFIER = 0.1;

/**
 * Checks url parameter `SETTINGS_TAB_PARAM`
 * if there is nothing there it returns DEFAULT_TAB
 * @returns Current settings tab
 */
export const useCurrentSettingsTab = () => {
  const params = useParams();
  return params[SETTINGS_TAB_PARAM];
};

/**
 * A React hook that manages the EnterpriseCustomerInviteKey urls, providing an
 * array of URLs from an API response, a boolean whether the request is pending,
 * and a function that allows subcomponents to refresh the data as needed.
 *
 * @param {string} enterpriseUUID EnterpriseCustomer UUID
 * @returns An object containing `links`, `loadingLinks`, and `refreshLinks`.
 */
export const useLinkManagement = (enterpriseUUID) => {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  const loadLinks = useCallback(() => {
    setLoadingLinks(true);
    const fetchLinksForEnterprise = async () => {
      try {
        const response = await LmsApiService.getAccessLinks(enterpriseUUID);
        const result = camelCaseObject(response.data);
        setLinks(result);
      } catch (error) {
        logError(error);
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchLinksForEnterprise();
    return () => {
      setLoadingLinks(false);
    };
  }, [enterpriseUUID]);

  useEffect(loadLinks, []);

  return {
    links,
    loadingLinks,
    refreshLinks: loadLinks,
  };
};

export const useStylesForCustomBrandColors = (branding) => {
  const brandColors = useMemo(
    () => {
      if (!isDefinedAndNotNull(branding)) {
        return undefined;
      }

      const primaryColor = Color(branding.primary_color);
      const secondaryColor = Color(branding.secondary_color);
      const tertiaryColor = Color(branding.tertiary_color);

      const whiteColor = Color(WHITE_COLOR);
      const darkColor = Color(DARK_COLOR);

      const getA11yTextColor = color => (color.isDark() ? whiteColor : darkColor);

      return {
        white: whiteColor,
        dark: darkColor,
        primary: {
          regular: primaryColor,
          light: primaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFIER),
          dark: primaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFIER),
          textColor: getA11yTextColor(primaryColor),
        },
        secondary: {
          regular: secondaryColor,
          light: secondaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFIER),
          dark: secondaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFIER),
          textColor: getA11yTextColor(secondaryColor),
        },
        tertiary: {
          regular: tertiaryColor,
          light: tertiaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFIER),
          dark: tertiaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFIER),
          textColor: getA11yTextColor(tertiaryColor),
        },
      };
    },
    [branding],
  );

  if (!isDefined(brandColors)) {
    return null;
  }

  const enterpriseColors = ['primary', 'secondary', 'tertiary'];
  const styles = enterpriseColors.map((colorName) => ({
    key: colorName,
    styles: (`
      .btn-brand-${colorName} {
        background-color: ${brandColors[colorName].regular.hex()} !important;
        border-color: ${brandColors[colorName].regular.hex()} !important;
        color: ${brandColors[colorName].textColor.hex()} !important;
      }
      .btn-brand-${colorName}:hover {
        background-color: ${brandColors[colorName].dark.hex()} !important;
        border-color: ${brandColors[colorName].dark.hex()} !important;
      }
      .btn-brand-${colorName}:focus:before {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .btn-brand-outline-${colorName} {
        border-color: ${brandColors[colorName].regular.hex()} !important;
        color: ${brandColors[colorName].regular.hex()} !important;
      }
      .btn-brand-outline-${colorName}:hover {
        border-color: ${brandColors[colorName].dark.hex()} !important;
        background-color: ${brandColors.white.mix(brandColors[colorName].light, COLOR_MIX_MODIFIER).hex()} !important;
      }
      .btn-brand-outline-${colorName}:focus:before {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .bg-brand-${colorName} {
        background-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .border-brand-${colorName} {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .color-brand-${colorName} {
        color: ${brandColors[colorName].regular.hex()} !important;
      }
      .text-brand-${colorName} {
        color: ${brandColors[colorName].textColor.hex()} !important;
      }
    `),
  }));
  styles.push({
    key: 'general',
    styles: (`
      .hero-brand {
        background-color: ${brandColors.primary.regular.hex()} !important;
        border-color: ${brandColors.tertiary.regular.hex()} !important;
        color: ${brandColors.primary.textColor.hex()} !important;
      }
    `),
  });

  return styles;
};

export default {
  useCurrentSettingsTab,
  useLinkManagement,
};

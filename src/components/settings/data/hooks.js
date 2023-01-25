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

  useEffect(loadLinks, [loadLinks]);

  return {
    links,
    loadingLinks,
    refreshLinks: loadLinks,
  };
};

export const useCustomBrandColors = (branding) => {
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

  return brandColors;
};

export default {
  useCurrentSettingsTab,
  useLinkManagement,
};

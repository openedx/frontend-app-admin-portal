import {
  Form, Container, Spinner,
} from '@edx/paragon';
import {
  useState, useContext, useEffect, useCallback,
} from 'react';
import { ActionRowSpacer } from '@edx/paragon/dist/ActionRow';
import { logError } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useHistory } from 'react-router-dom';
import { ALERT_TEXT, BUTTON_TEXT, LEARNER_PORTAL_CATALOG_VISIBILITY } from '../data/constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions } from '../../EnterpriseApp/data/enterpriseCurationReducer';
import EVENT_NAMES from '../../../eventTracking';
import { useContentHighlightsContext } from '../data/hooks';

const ContentHighlightCatalogVisibilityRadioInput = () => {
  const { setCatalogVisibilityAlert } = useContentHighlightsContext();
  const {
    enterpriseCuration: {
      enterpriseCuration,
      updateEnterpriseCuration,
      dispatch,
    },
  } = useContext(EnterpriseAppContext);
  const { highlightSets, canOnlyViewHighlightSets } = enterpriseCuration;
  const [radioGroupVisibility, setRadioGroupVisibility] = useState(true);
  const history = useHistory();
  const { location } = history;
  const [isEntireCatalogSelectionLoading, setIsEntireCatalogSelectionLoading] = useState(false);
  const [isHighlightsCatalogSelectionLoading, setIsHighlightsCatalogSelectionLoading] = useState(false);

  /**
   * Sets enterpriseCuration.canOnlyViewHighlightSets to false if there are no highlight sets
   * when the user enters content highlights dashboard.
   */
  const setDefault = useCallback(async () => {
    try {
      await updateEnterpriseCuration({
        canOnlyViewHighlightSets: false,
      });
    } catch (error) {
      logError(`${error}: Error updating enterprise curation setting with no highlight sets,
       ContentHighlightCatalogVsibiilityRadioInput`);
    }
  }, [updateEnterpriseCuration]);
  useEffect(() => {
    if (highlightSets.length < 1 && canOnlyViewHighlightSets) {
      setDefault();
    }
  }, [canOnlyViewHighlightSets, highlightSets.length, setDefault, updateEnterpriseCuration]);
  // Sets default radio button based on number of highlight sets && catalog visibility setting
  const catalogVisibilityValue = !canOnlyViewHighlightSets || highlightSets.length < 1
    ? LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value
    : LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value;
  const [value, setValue] = useState(catalogVisibilityValue);

  const handleChange = async (e) => {
    const newTabValue = e.target.value;
    try {
      // Show loading spinner
      if (newTabValue === LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value) {
        setIsEntireCatalogSelectionLoading(true);
        setIsHighlightsCatalogSelectionLoading(false);
      }
      if (newTabValue === LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value) {
        setIsHighlightsCatalogSelectionLoading(true);
        setIsEntireCatalogSelectionLoading(false);
      }
      const data = await updateEnterpriseCuration({
        canOnlyViewHighlightSets: LEARNER_PORTAL_CATALOG_VISIBILITY[newTabValue].canOnlyViewHighlightSets,
      });
      // Send Track Event
      const trackInfo = {
        can_only_view_highlight_sets: LEARNER_PORTAL_CATALOG_VISIBILITY[newTabValue].canOnlyViewHighlightSets,
      };
      sendEnterpriseTrackEvent(
        enterpriseCuration.enterpriseCustomer,
        EVENT_NAMES.CONTENT_HIGHLIGHTS.HIGHLIGHT_DASHBOARD_SET_CATALOG_VISIBILITY,
        trackInfo,
      );
      // Set toast and closes alert if open
      if (data) {
        setCatalogVisibilityAlert({
          isOpen: false,
        });
        dispatch(enterpriseCurationActions.setHighlightToast(ALERT_TEXT.TOAST_TEXT.catalogVisibility));
        history.push(location.pathname, {
          highlightToast: true,
        });
        setValue(newTabValue);
      }
    } catch (error) {
      logError(error);
      setCatalogVisibilityAlert({
        isOpen: true,
      });
    } finally {
      // Hide loading spinner
      setIsEntireCatalogSelectionLoading(false);
      setIsHighlightsCatalogSelectionLoading(false);
    }
  };
  useEffect(() => {
    if (highlightSets.length > 0) {
      setRadioGroupVisibility(false);
    }
  }, [highlightSets]);

  return (
    <Container>
      <Form.Group>
        <Form.RadioSet
          name="display-content"
          onChange={handleChange}
          value={value}
        >
          <div className="d-flex align-items-center position-relative">
            {isEntireCatalogSelectionLoading && (
            <Spinner
              className="position-absolute"
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control`}
              size="sm"
              style={{
                left: -24,
              }}
              animation="border"
              screenReaderText="loading changes to view all content"
            />
            )}
            <ActionRowSpacer />
            <Form.Radio
              value={LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}
              type="radio"
              disabled={radioGroupVisibility || isEntireCatalogSelectionLoading || isHighlightsCatalogSelectionLoading}
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control-button`}
            >
              {BUTTON_TEXT.catalogVisibilityRadio1}
            </Form.Radio>
          </div>
          <div className="d-flex align-items-center position-relative">
            {isHighlightsCatalogSelectionLoading && (
            <Spinner
              className="position-absolute"
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`}
              size="sm"
              style={
                {
                  left: -24,
                }
            }
              animation="border"
              screenReaderText="loading changes to view highlighted content only"
            />
            )}
            <ActionRowSpacer />
            <Form.Radio
              value={LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}
              type="radio"
              disabled={radioGroupVisibility || isEntireCatalogSelectionLoading || isHighlightsCatalogSelectionLoading}
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control-button`}
            >
              {BUTTON_TEXT.catalogVisibilityRadio2}
            </Form.Radio>
          </div>
        </Form.RadioSet>
      </Form.Group>
    </Container>
  );
};

export default ContentHighlightCatalogVisibilityRadioInput;

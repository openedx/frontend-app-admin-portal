import {
  Form, Container, Spinner, ActionRow,
} from '@edx/paragon';
import { useState, useContext, useEffect } from 'react';
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
  /**
   * Sets enterpriseCuration.canOnlyViewHighlightSets to false if there are no highlight sets
   * when the user enters content highlights dashboard.
   */
  useEffect(() => {
    if (highlightSets.length < 1 && canOnlyViewHighlightSets) {
      const setDefault = async () => {
        try {
          await updateEnterpriseCuration({
            canOnlyViewHighlightSets: false,
          });
        } catch (error) {
          logError(`${error}: Error updating enterprise curation setting with no highlight sets,
           ContentHighlightCatalogVsibiilityRadioInput`);
        }
      };
      setDefault();
    }
  }, [canOnlyViewHighlightSets, highlightSets.length, updateEnterpriseCuration]);
  // Sets default radio button based on number of highlight sets && catalog visibility setting
  const catalogVisibilityValue = !canOnlyViewHighlightSets || highlightSets.length < 1
    ? LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value
    : LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value;
  const [value, setValue] = useState(catalogVisibilityValue);
  const handleChange = async (e) => {
    try {
      // persist ui changes on the dom to log event changes
      e.persist();
      // Show loading spinner
      if (e.target.dataset.spinnerUi) {
        document.getElementById(e.target.dataset.spinnerUi).hidden = false;
      }
      // Update enterprise curation setting
      const data = await updateEnterpriseCuration({
        canOnlyViewHighlightSets: LEARNER_PORTAL_CATALOG_VISIBILITY[e.target.value].canOnlyViewHighlightSets,
      });
      // Send Track Event
      const trackInfo = {
        can_only_view_highlight_sets: LEARNER_PORTAL_CATALOG_VISIBILITY[e.target.value].canOnlyViewHighlightSets,
      };
      sendEnterpriseTrackEvent(
        enterpriseCuration.enterpriseCustomer,
        EVENT_NAMES.CONTENT_HIGHLIGHTS.HIGHLIGHT_DASHBOARD_SET_CATALOG_VISIBILITY,
        trackInfo,
      );
      // Hide loading spinner and set toast and closes alert if open
      if (data) {
        document.getElementById(e.target.dataset.spinnerUi).hidden = true;
        setCatalogVisibilityAlert({
          isOpen: false,
        });
        dispatch(enterpriseCurationActions.setHighlightToast(ALERT_TEXT.TOAST_TEXT.catalogVisibility));
        history.push(location.pathname, {
          highlightToast: true,
        });
      }
      // Set radio button value
      setValue(e.target.value);
    } catch (error) {
      logError(error);
      // Hide loading spinner and set alert if error
      document.getElementById(e.target.dataset.spinnerUi).hidden = true;
      setCatalogVisibilityAlert({
        isOpen: true,
      });
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
          <ActionRow direction="horizontal">
            <Spinner
              hidden
              id={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control`}
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control`}
              style={{
                width: 24,
                height: 24,
              }}
              animation="border"
              screenReaderText="loading changes to view all content"
            />
            <ActionRowSpacer />
            <Form.Radio
              value={LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}
              type="radio"
              disabled={radioGroupVisibility}
              data-spinner-ui={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control`}
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control-button`}
            >
              {BUTTON_TEXT.catalogVisibilityRadio1}
            </Form.Radio>
          </ActionRow>
          <ActionRow>
            <Spinner
              hidden
              id={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`}
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`}
              style={
                {
                  width: 24,
                  height: 24,
                }
            }
              animation="border"
              screenReaderText="loading changes to view highlighted content only"
            />
            <ActionRowSpacer />
            <Form.Radio
              value={LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}
              type="radio"
              disabled={radioGroupVisibility}
              data-spinner-ui={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`}
              data-testid={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control-button`}
            >
              {BUTTON_TEXT.catalogVisibilityRadio2}
            </Form.Radio>
          </ActionRow>
        </Form.RadioSet>
      </Form.Group>
    </Container>
  );
};

export default ContentHighlightCatalogVisibilityRadioInput;

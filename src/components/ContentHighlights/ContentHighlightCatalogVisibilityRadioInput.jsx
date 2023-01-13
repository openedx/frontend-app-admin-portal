import {
  Form, Container, Spinner, ActionRow,
} from '@edx/paragon';
import { useState, useContext, useEffect } from 'react';
import { ActionRowSpacer } from '@edx/paragon/dist/ActionRow';
import { BUTTON_TEXT, LEARNER_PORTAL_CATALOG_VISIBILITY } from './data/constants';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';

const ContentHighlightCatalogVisibilityRadioInput = () => {
  const { enterpriseCuration: { enterpriseCuration, updateEnterpriseCuration } } = useContext(EnterpriseAppContext);
  const { highlightSets, canOnlyViewHighlightSets } = enterpriseCuration;
  const [value, setValue] = useState(
    !canOnlyViewHighlightSets || highlightSets.length < 1
      ? LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value
      : LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value,
  );
  const [radioGroupVisibility, setRadioGroupVisibility] = useState(true);
  const handleChange = async (e) => {
    e.persist();
    if (e.target.dataset.spinnerUi) {
      document.getElementById(e.target.dataset.spinnerUi).hidden = false;
      // e.target.hidden = true;
    }
    const data = await updateEnterpriseCuration({
      canOnlyViewHighlightSets: LEARNER_PORTAL_CATALOG_VISIBILITY[e.target.value].canOnlyViewHighlightSets,
    });
    if (data) {
      // e.target.hidden = false;
      document.getElementById(e.target.dataset.spinnerUi).hidden = true;
    }
    setValue(e.target.value);
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
              style={{
                width: '24px',
                height: '24px',
              }}
              animation="border"
              screenReaderText="loading"
            />
            <ActionRowSpacer />
            <Form.Radio
              value={LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}
              type="radio"
              disabled={radioGroupVisibility}
              data-spinner-ui={`${LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}-form-control`}
            >
              {BUTTON_TEXT.catalogVisibilityRadio1}
            </Form.Radio>
          </ActionRow>
          <ActionRow>
            <Spinner
              hidden
              id={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`}
              style={{
                width: '24px',
                height: '24px',
              }}
              animation="border"
              screenReaderText="loading"
            />
            <ActionRowSpacer />
            <Form.Radio
              value={LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}
              type="radio"
              disabled={radioGroupVisibility}
              data-spinner-ui={`${LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}-form-control`}
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

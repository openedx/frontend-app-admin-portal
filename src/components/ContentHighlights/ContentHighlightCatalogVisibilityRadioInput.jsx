import { Form, Container } from '@edx/paragon';
import { useState, useContext, useEffect } from 'react';
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
    await updateEnterpriseCuration({
      canOnlyViewHighlightSets: LEARNER_PORTAL_CATALOG_VISIBILITY[e.target.value].canOnlyViewHighlightSets,
    });
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
          <Form.Radio
            value={LEARNER_PORTAL_CATALOG_VISIBILITY.ALL_CONTENT.value}
            type="radio"
            disabled={radioGroupVisibility}
          >
            {BUTTON_TEXT.catalogVisibilityRadio1}
          </Form.Radio>
          <Form.Radio
            value={LEARNER_PORTAL_CATALOG_VISIBILITY.HIGHLIGHTED_CONTENT.value}
            type="radio"
            disabled={radioGroupVisibility}
          >
            {BUTTON_TEXT.catalogVisibilityRadio2}
          </Form.Radio>
        </Form.RadioSet>
      </Form.Group>
    </Container>
  );
};

export default ContentHighlightCatalogVisibilityRadioInput;

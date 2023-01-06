import { Form, Container } from '@edx/paragon';
import { useState } from 'react';
import { BUTTON_TEXT } from './data/constants';

const ContentHighlightCatalogVisibilityRadioInput = () => {
  const [value, setValue] = useState('show-only-highlighted-content');
  const handleChange = e => setValue(e.target.value);
  return (
    <Container>
      <Form.Group>
        <Form.RadioSet
          name="display-content"
          onChange={handleChange}
          value={value}
        >
          <Form.Radio
            value="show-only-highlighted-content"
            type="radio"
          >
            {BUTTON_TEXT.catalogVisibilityRadio1}
          </Form.Radio>
          <Form.Radio
            value="show-all-content"
            type="radio"
          >
            {BUTTON_TEXT.catalogVisibilityRadio2}
          </Form.Radio>
        </Form.RadioSet>
      </Form.Group>
    </Container>
  );
};

export default ContentHighlightCatalogVisibilityRadioInput;

import React from 'react';
import { Provider } from 'react-redux';
import { reduxForm } from 'redux-form';

import { screen, render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router';
import EmailTemplateForm, { EMAIL_FORM_NAME, EMAIL_TEMPLATE_FIELDS } from '.';
import { MODAL_TYPES } from './constants';
import { TEMLATE_SOURCE_FIELDS_TEST_ID } from '../TemplateSourceFields';
import RenderField from '../RenderField';

const mockStore = configureMockStore([thunk]);

const ConnectedEmailTemplateForm = reduxForm({ form: 'test' })(EmailTemplateForm);

const initialState = {
  emailTemplate: {
    emailTemplateSource: 'foo',
  },
  allEmailTemplates: [],
};

const EmailTemplateFormWrapper = (props) => (
  <MemoryRouter>
    <Provider store={mockStore(initialState)}>
      <ConnectedEmailTemplateForm {...props} />
    </Provider>
  </MemoryRouter>
);

describe('EmailTemplateForm', () => {
  it('renders a form', () => {
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} />);
    expect(screen.getByText(EMAIL_FORM_NAME)).toBeInTheDocument();
  });
  it('renders default fields', () => {
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} />);
    Object.values(EMAIL_TEMPLATE_FIELDS).forEach((field) => {
      expect(screen.getByText(field.label)).toBeInTheDocument();
    });
  });
  it('renders the template source fields', () => {
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} />);
    expect(screen.getByTestId(TEMLATE_SOURCE_FIELDS_TEST_ID)).toBeInTheDocument();
  });
  it('renders custom fields', () => {
    const fields = {
      foo: {
        id: 'foo',
        name: 'foo',
        component: RenderField,
        label: 'Awesome field',
        type: 'text',
      },
    };
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} fields={fields} />);
    expect(screen.getByText(fields.foo.label)).toBeInTheDocument();
    Object.values(EMAIL_TEMPLATE_FIELDS).forEach((field) => {
      expect(screen.queryByText(field.label)).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import { Provider } from 'react-redux';
import { reduxForm } from 'redux-form';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { screen, render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router';
import EmailTemplateForm, { getTemplateEmailFields } from '.';
import { MODAL_TYPES } from './constants';
import { TEMLATE_SOURCE_FIELDS_TEST_ID } from '../TemplateSourceFields';
import RenderField from '../RenderField';

const mockStore = configureMockStore([thunk]);

const ConnectedEmailTemplateForm = reduxForm({ form: 'test' })(EmailTemplateForm);

const mockFormatMessage = message => message.defaultMessage;

const initialState = {
  emailTemplate: {
    emailTemplateSource: 'foo',
  },
  allEmailTemplates: [],
};

const EmailTemplateFormWrapper = (props) => (
  <MemoryRouter>
    <Provider store={mockStore(initialState)}>
      <IntlProvider locale="en">
        <ConnectedEmailTemplateForm {...props} />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('EmailTemplateForm', () => {
  it('renders a form', () => {
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} />);
    expect(screen.getByText('Email Template')).toBeInTheDocument();
  });
  it('renders default fields', () => {
    const emailTemplateFields = getTemplateEmailFields(mockFormatMessage);
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} />);
    Object.values(emailTemplateFields).forEach((field) => {
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
    const emailTemplateFields = getTemplateEmailFields(mockFormatMessage);
    render(<EmailTemplateFormWrapper emailTemplateType={MODAL_TYPES.remind} fields={fields} />);
    expect(screen.getByText(fields.foo.label)).toBeInTheDocument();
    Object.values(emailTemplateFields).forEach((field) => {
      expect(screen.queryByText(field.label)).not.toBeInTheDocument();
    });
  });
});

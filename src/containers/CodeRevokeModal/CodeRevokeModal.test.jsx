import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, render, screen } from '@testing-library/react';
import last from 'lodash/last';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import CodeRevokeModal from './index';
import revokeEmailTemplate from '../../components/CodeRevokeModal/emailTemplate';
import {
  SET_EMAIL_TEMPLATE_SOURCE,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
} from '../../data/constants/emailTemplate';
import { configuration } from '../../config';

const mockStore = configureMockStore([thunk]);
const enterpriseSlug = 'bearsRus';
const initialState = {
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      revoke: {
        'email-template-subject': revokeEmailTemplate.subject,
        'email-template-greeting': revokeEmailTemplate.greeting || '',
        'email-template-body': revokeEmailTemplate.body,
        'email-template-closing': revokeEmailTemplate.closing,
        'email-template-files': revokeEmailTemplate.files,
      },
    },
    revoke: {
      'email-template-subject': revokeEmailTemplate.subject,
      'email-template-greeting': revokeEmailTemplate.greeting || '',
      'email-template-body': revokeEmailTemplate.body,
      'email-template-closing': revokeEmailTemplate.closing,
      'email-template-files': revokeEmailTemplate.files,
    },
  },
  portalConfiguration: {
    enterpriseSlug,
    enableLearnerPortal: true,
  },
  form: {
    'code-revoke-modal-form': {
      initial: {},
    },
  },
};

const couponId = 1;
const couponTitle = 'AABBCC';
const data = {
  code: 'ABC101',
  assigned_to: 'edx@example.com',
  base_enterprise_url: `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`,
};
const codeRevokeRequestData = (numCodes) => {
  const assignment = {
    code: data.code,
    user: {
      email: data.assigned_to,
    },
  };
  return {
    assignments: Array(numCodes).fill(assignment),
    do_not_email: false,
    template: revokeEmailTemplate.body,
    template_subject: revokeEmailTemplate.subject,
    template_greeting: revokeEmailTemplate.greeting || '',
    template_closing: revokeEmailTemplate.closing,
    template_files: revokeEmailTemplate.files,
    base_enterprise_url: data.base_enterprise_url,
  };
};

const CodeRevokeModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <IntlProvider locale="en">
        <CodeRevokeModal
          couponId={couponId}
          title={couponTitle}
          onClose={() => {}}
          onSuccess={() => {}}
          {...props}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

const store = mockStore({ ...initialState });
CodeRevokeModalWrapper.defaultProps = {
  store,
};

CodeRevokeModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('CodeRevokeModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders individual assignment revoke modal', async () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');

    render(<CodeRevokeModalWrapper data={data} />);
    expect(screen.getByText(couponTitle)).toBeTruthy();

    expect(screen.getByText(`Code: ${data.code}`)).toBeTruthy();
    expect(screen.getByText(`Email: ${data.assigned_to}`)).toBeTruthy();

    expect(screen.getByText('Email Template')).toBeTruthy();
    fireEvent.click(screen.getByText('Revoke'));
    expect(spy).toHaveBeenCalledWith(couponId, codeRevokeRequestData(1));
  });

  it('renders bulk assignment revoke modal', async () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const codeRevokeData = [data, data];
    render(<CodeRevokeModalWrapper
      data={{ ...codeRevokeData, selectedCodes: codeRevokeData }}
      isBulkRevoke
    />);

    expect(screen.getByTestId('assignment-details-codes').childNodes[0].textContent).toEqual('Selected codes: 2');
    fireEvent.click(screen.getByText('Revoke'));
    expect(spy).toHaveBeenCalledWith(couponId, codeRevokeRequestData(2));
  });

  it('returns the correct data if learner portal is not enabled', async () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const codeRevokeData = [data, data];
    render(<CodeRevokeModalWrapper
      data={{ ...codeRevokeData, selectedCodes: codeRevokeData }}
      isBulkRevoke
      store={mockStore({
        ...initialState,
        portalConfiguration: { ...initialState.portalConfiguration, enableLearnerPortal: false },
      })}
    />);

    fireEvent.click(screen.getByText('Revoke'));
    const expectedData = codeRevokeRequestData(2);
    delete expectedData.base_enterprise_url;
    expect(spy).toHaveBeenCalledWith(couponId, expectedData);
  });

  it('throws error if no code is selected for bulk revoke', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeRevoke');
    const codeRevokeData = [data, data];
    render(<CodeRevokeModalWrapper
      data={{ ...codeRevokeData, selectedCodes: [] }}
      isBulkRevoke
    />);

    expect(screen.queryByTestId('assignment-details-codes')).toBeFalsy();
    fireEvent.click(screen.getByText('Revoke'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders <SaveTemplateButton />', () => {
    render(<CodeRevokeModalWrapper />);
    expect(screen.getByText('Save Template')).toBeTruthy();
  });

  it('renders <TemplateSourceFields /> with source new_email', () => {
    render(<CodeRevokeModalWrapper />);
    expect(screen.getAllByText('New Email')[0].getAttribute('aria-pressed')).toEqual('true');
    expect(screen.getAllByText('From Template')[0].getAttribute('aria-pressed')).toEqual('false');
    expect(screen.getAllByText('New Email')[0].getAttribute('style')).toEqual('pointer-events: none;');
    expect(screen.getAllByText('From Template')[0].getAttribute('style')).toEqual('pointer-events: auto;');
    expect(screen.getAllByRole('textbox', { name: /Template Name/i })).toHaveLength(1);

    fireEvent.click(screen.getAllByText('From Template')[0]);
    expect(last(store.getActions())).toEqual({
      type: SET_EMAIL_TEMPLATE_SOURCE,
      payload: { emailTemplateSource: EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE },
    });
  });

  it('renders <TemplateSourceFields /> with source from_template', () => {
    const newStore = mockStore({
      ...initialState,
      emailTemplate: {
        ...initialState.emailTemplate,
        emailTemplateSource: EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
      },
    });
    render(<CodeRevokeModalWrapper store={newStore} />);
    expect(screen.getAllByText('New Email')[0].getAttribute('aria-pressed')).toEqual('false');
    expect(screen.getAllByText('From Template')[0].getAttribute('aria-pressed')).toEqual('true');
    expect(screen.getAllByText('New Email')[0].getAttribute('style')).toEqual('pointer-events: auto;');
    expect(screen.getAllByText('From Template')[0].getAttribute('style')).toEqual('pointer-events: none;');
    expect(screen.getAllByRole('combobox', { name: /Template Name/i })).toHaveLength(1);

    fireEvent.click(screen.getAllByText('New Email')[0]);
    expect(last(newStore.getActions())).toEqual({
      type: SET_EMAIL_TEMPLATE_SOURCE,
      payload: { emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL },
    });
  });
});

import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, render, screen } from '@testing-library/react';
import last from 'lodash/last';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CodeReminderModal from './index';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import remindEmailTemplate from '../../components/CodeReminderModal/emailTemplate';
import {
  SET_EMAIL_TEMPLATE_SOURCE,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE,
} from '../../data/constants/emailTemplate';
import { configuration } from '../../config';

const enterpriseSlug = 'bearsRus';
const sampleCodeData = {
  code: 'test-code-1',
  assigned_to: 'test@bestrun.com',
  redemptions: {
    total: 100,
    used: 10,
  },
  error: null,
};
const sampleTableData = {
  loading: false,
  error: null,
  data: {
    count: 3,
    num_pages: 2,
    current_page: 1,
    results: [
      sampleCodeData,
      {
        ...sampleCodeData,
        code: 'test-code-2',
        redemptions: {
          total: 100,
          used: 100,
        },
      },
      {
        ...sampleCodeData,
        code: 'test-code-3',
        assigned_to: null,
      },
    ],
  },
};

const mockStore = configureMockStore([thunk]);
const initialState = {
  table: {
    'coupon-details': sampleTableData,
  },
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      remind: {
        'email-template-subject': remindEmailTemplate.subject,
        'email-template-greeting': remindEmailTemplate.greeting,
        'email-template-body': remindEmailTemplate.body,
        'email-template-closing': remindEmailTemplate.closing,
        'email-template-files': remindEmailTemplate.files,
      },
    },
    remind: {
      'email-template-subject': remindEmailTemplate.subject,
      'email-template-greeting': remindEmailTemplate.greeting,
      'email-template-body': remindEmailTemplate.body,
      'email-template-closing': remindEmailTemplate.closing,
      'email-template-files': remindEmailTemplate.files,
    },
  },
  portalConfiguration: {
    enterpriseSlug,
    enableLearnerPortal: true,
  },
  form: {
    'code-reminder-modal-form': {
      initial: {},
    },
  },
};

const couponId = 1;
const data = {
  code: 'ABC101',
  assigned_to: 'edx@example.com',
  base_enterprise_url: `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`,
};

const codeReminderRequestData = (numCodes, selectedToggle) => {
  const assignment = {
    code: data.code,
    user: {
      email: data.assigned_to,
    },
  };
  const options = {
    template: remindEmailTemplate.body,
    template_subject: remindEmailTemplate.subject,
    template_greeting: remindEmailTemplate.greeting,
    template_closing: remindEmailTemplate.closing,
    template_files: remindEmailTemplate.files,
    base_enterprise_url: data.base_enterprise_url,
  };
  if (numCodes === 0) {
    options.code_filter = selectedToggle;
  } else {
    options.assignments = Array(numCodes).fill(assignment);
  }
  return options;
};

const CodeReminderModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <IntlProvider locale="en">
        <CodeReminderModal
          couponId={couponId}
          title="AABBCC"
          onClose={() => {}}
          onSuccess={() => {}}
          {...props}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

const store = mockStore({ ...initialState });
CodeReminderModalWrapper.defaultProps = {
  store,
};

CodeReminderModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('CodeReminderModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders individual reminder modal', () => {
    const codeRemindData = [data, data];
    render(<CodeReminderModalWrapper
      data={{ ...codeRemindData, selectedCodes: [data] }}
    />);
    expect(screen.getByTestId('assignment-details').children.length).toBe(0);
  });

  it('renders bulk reminder modal', async () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeReminder');
    const codeRemindData = [data, data];
    render(<CodeReminderModalWrapper
      data={{ ...codeRemindData, selectedCodes: codeRemindData }}
      isBulkRemind
    />);

    expect(screen.getByTestId('assignment-details-codes').childNodes[0].textContent).toEqual('Selected codes: 2');
    expect(screen.getByText('Email Template')).toBeTruthy();
    fireEvent.click(screen.getByText('Remind'));
    expect(spy).toHaveBeenCalledWith(couponId, codeReminderRequestData(2));
  });

  it('returns the correct data if learner portal is not enabled', async () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeReminder');
    const codeRemindData = [data, data];
    render(<CodeReminderModalWrapper
      data={{
        ...codeRemindData,
        selectedCodes: codeRemindData,
      }}
      store={mockStore({
        ...initialState,
        portalConfiguration: { ...initialState.portalConfiguration, enableLearnerPortal: false },
      })}
      isBulkRemind
    />);

    expect(screen.getByTestId('assignment-details-codes').childNodes[0].textContent).toEqual('Selected codes: 2');
    expect(screen.getByText('Email Template')).toBeTruthy();
    fireEvent.click(screen.getByText('Remind'));
    const expectedData = codeReminderRequestData(2);
    delete expectedData.base_enterprise_url;
    expect(spy).toHaveBeenCalledWith(couponId, expectedData);
  });

  it('renders remind all modal if no code is selected for bulk remind', () => {
    spy = jest.spyOn(EcommerceApiService, 'sendCodeReminder');
    const codeReminderData = [data, data];
    const selectedToggle = 'unredeemed';
    render(<CodeReminderModalWrapper
      data={{ ...codeReminderData, selectedCodes: [] }}
      selectedToggle={selectedToggle}
      isBulkRemind
    />);

    expect(screen.getByTestId('assignment-details-codes').childNodes[0].textContent).toEqual('Selected codes: 3');
    fireEvent.click(screen.getByText('Remind'));
    expect(spy).toHaveBeenCalledWith(couponId, codeReminderRequestData(0, selectedToggle));
  });

  it('renders <SaveTemplateButton />', () => {
    render(<CodeReminderModalWrapper />);
    expect(screen.getByText('Save Template')).toBeTruthy();
  });

  it('renders <TemplateSourceFields /> with source new_email', () => {
    render(<CodeReminderModalWrapper />);

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
    render(<CodeReminderModalWrapper store={newStore} />);

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

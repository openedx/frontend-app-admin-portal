import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import NewSSOConfigCard from '../NewSSOConfigCard';
import LmsApiService from '../../../../data/services/LmsApiService';

describe('New SSO Config Card Tests', () => {
  test('displays enabled and validated status icon properly', async () => {
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: true,
          modified: '2021-08-05T15:00:00Z',
          validated_at: '2021-08-07T15:00:00Z',
          configured_at: '2021-08-06T15:00:00Z',
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-enabled-icon',
      ),
    ).toBeInTheDocument();
  });
  test('displays not validated status icon properly', async () => {
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: true,
          modified: '2021-08-05T15:00:00Z',
          validated_at: null,
          configured_at: '2021-08-05T15:00:00Z',
          submitted_at: '2021-08-04T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-off-not-validated-icon',
      ),
    ).toBeInTheDocument();
  });
  test('displays key off icon status icon properly', async () => {
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: false,
          modified: '2021-08-05T15:00:00Z',
          validated_at: '2021-08-05T15:00:00Z',
          configured_at: '2021-08-05T15:00:00Z',
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-off-icon',
      ),
    ).toBeInTheDocument();
  });
  test('displays badges properly', async () => {
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: false,
          modified: '2021-08-05T15:00:00Z',
          validated_at: null,
          configured_at: null,
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-badge-in-progress',
      ),
    ).toBeInTheDocument();
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: false,
          modified: '2021-08-05T15:00:00Z',
          validated_at: '2021-09-05T15:00:00Z',
          configured_at: '2021-09-05T15:00:00Z',
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-badge-disabled',
      ),
    ).toBeInTheDocument();
  });
  test('displays configure button properly', async () => {
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: false,
          modified: '2021-08-05T15:00:00Z',
          validated_at: null,
          configured_at: '2021-08-05T15:00:00Z',
          submitted_at: '2021-07-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-configure-button',
      ),
    ).toBeInTheDocument();
  });
  test('displays enable button properly', async () => {
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: false,
          modified: '2021-08-05T15:00:00Z',
          validated_at: '2021-08-05T15:00:00Z',
          configured_at: '2021-09-05T15:00:00Z',
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    expect(
      screen.getByTestId(
        'existing-sso-config-card-enable-button',
      ),
    ).toBeInTheDocument();
  });
  test('handles kebob Delete dropdown option', async () => {
    const spy = jest.spyOn(LmsApiService, 'deleteEnterpriseSsoOrchestrationRecord');
    spy.mockImplementation(() => Promise.resolve({}));
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: false,
          modified: '2021-08-05T15:00:00Z',
          validated_at: '2021-08-05T15:00:00Z',
          configured_at: '2021-09-05T15:00:00Z',
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    act(() => {
      userEvent.click(screen.getByTestId('existing-sso-config-card-dropdown'));
    });
    act(() => {
      userEvent.click(screen.getByTestId('existing-sso-config-delete-dropdown'));
    });
    expect(spy).toBeCalledTimes(1);
  });
  test('handles kebob Disable dropdown option', async () => {
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseSsoOrchestrationRecord');
    spy.mockImplementation(() => Promise.resolve({}));
    render(
      <NewSSOConfigCard
        config={{
          display_name: 'test',
          uuid: 'ecc16800-c1cc-4cdb-93aa-186f71b026ca',
          active: true,
          modified: '2021-08-05T15:00:00Z',
          validated_at: '2021-08-05T15:00:00Z',
          configured_at: '2021-09-05T15:00:00Z',
          submitted_at: '2021-08-05T15:00:00Z',
        }}
        setLoading={jest.fn()}
        setRefreshBool={jest.fn()}
        refreshBool={false}
      />,
    );
    act(() => {
      userEvent.click(screen.getByTestId('existing-sso-config-card-dropdown'));
    });
    act(() => {
      userEvent.click(screen.getByTestId('existing-sso-config-disable-dropdown'));
    });
    expect(spy).toBeCalledTimes(1);
  });
});

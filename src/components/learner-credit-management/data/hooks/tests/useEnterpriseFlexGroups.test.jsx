/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { camelCaseObject } from '@edx/frontend-platform';

import { fetchPaginatedData } from '../../../../../data/services/apiServiceUtils';
import LmsApiService from '../../../../../data/services/LmsApiService';

const axiosMock = new MockAdapter(axios);
jest.mock('../../../../../data/services/apiServiceUtils');

const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseFlexGroupsResponse = {
  results: [
    {
      enterprise_customer: '66b5922b-a22b-4a7b-b587-d4af0378bd6f',
      name: 'the cool group',
      uuid: 'eb0172cb-8d06-42d8-9e64-c6f6e4fa118e',
      applies_to_all_contexts: false,
      accepted_members_count: 1,
      group_type: 'flex',
      created: '2024-04-11T18:40:13.803371Z',
    },
    {
      enterprise_customer: '66b5922b-a22b-4a7b-b587-d4af0378bd6f',
      name: 'the super cool group',
      uuid: '0af1c58a-e7d1-493a-b31f-db819ba48687',
      applies_to_all_contexts: false,
      accepted_members_count: 0,
      group_type: 'flex',
      created: '2024-04-11T18:40:27.076211Z',
    },
    {
      enterprise_customer: '31885c12-f5ae-4b2c-b78d-460cb2e0972b',
      name: 'Group ABC',
      uuid: 'f9aa8f4e-2baa-45c0-aaed-633f7746319a',
      applies_to_all_contexts: false,
      accepted_members_count: 0,
      group_type: 'budget',
      created: '2024-05-31T02:23:33.311109Z',
    },
  ],
};

const mockGroupUuid = 'test-group-uuid';
const mockLearners = {
  results: [
    {
      enterprise_customer_user_id: 4967,
      lms_user_id: 5272644,
      pending_enterprise_customer_user_id: null,
      enterprise_group_membership_uuid: '79e86b2a-97af-4136-a9d0-367fb555bc42',
      member_details: {
        user_email: 'bbeggs+alc@2u.com',
        user_name: 'bbtestalc',
      },
      recent_action: 'Accepted: October 16, 2024',
      status: 'accepted',
      activated_at: '2024-10-16T02:48:16Z',
    },
  ],
};

describe('useEnterpriseFlexGroups', () => {
  const enterpriseGroupListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_group/`;
  beforeEach(() => {
    jest.clearAllMocks();
    fetchPaginatedData.mockReturnValue(
      {
        results: camelCaseObject([...mockEnterpriseFlexGroupsResponse.results]),
        response: camelCaseObject(mockEnterpriseFlexGroupsResponse),
      },
    );
    axiosMock.reset();
  });

  it('returns the api call with a 200', async () => {
    axiosMock.onGet(enterpriseGroupListUrl).reply(200, mockEnterpriseFlexGroupsResponse);
    const { results } = await fetchPaginatedData(mockEnterpriseId);
    expect(results).toEqual(camelCaseObject(mockEnterpriseFlexGroupsResponse.results));
  });
});

describe('getGroupMemberEmails', () => {
  const enterpriseGroupLearnerUrl = `${LmsApiService.enterpriseGroupUrl}${mockGroupUuid}/learners`;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchPaginatedData.mockReturnValue(
      {
        results: camelCaseObject([...mockLearners.results]),
        response: camelCaseObject(mockLearners),
      },
    );
    axiosMock.reset();
  });

  it('returns the api call with a 200', async () => {
    axiosMock.onGet(enterpriseGroupLearnerUrl).reply(200, mockLearners);
    const { results } = await fetchPaginatedData(mockGroupUuid);
    expect(results).toEqual(camelCaseObject(mockLearners.results));
  });
});

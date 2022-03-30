import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const enterpriseId = 'an-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
    learnerPortalEnabled: true,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);

export {
  getMockStore,
  initialStore,
};

import { capitalizeFirstLetter } from '../../../../utils';

export const transformRequestOverview = (requestStates) => {
  const allowedStates = ['requested', 'cancelled', 'declined'];

  return requestStates
    .filter(({ state }) => allowedStates.includes(state))
    .map(({ state, count }) => ({
      name: capitalizeFirstLetter(state),
      number: count,
      value: state,
    }));
};

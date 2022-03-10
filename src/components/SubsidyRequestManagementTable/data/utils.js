import { capitalizeFirstLetter } from '../../../utils';

export const transformRequestOverview = (requestStates) => {
  const requestOverview = {
    requested: 0,
    approved: 0,
    declined: 0,
  };
  // There are other request states beyond "requested", "approved", and "declined" includin
  // "pending" and "error". By default, we do not want to display these in the request status
  // filters as they are implementation details that should only be exposed when request states
  // are actually in that state.
  requestStates.forEach(({ state, count }) => {
    requestOverview[state] = count;
  });
  return Object.entries(requestOverview).map(([state, count]) => ({
    name: capitalizeFirstLetter(state),
    number: count,
    value: state,
  }));
};

export const transformRequests = requests => requests.map((request) => ({
  uuid: request.uuid,
  email: request.email,
  courseTitle: request.courseTitle,
  courseId: request.courseId,
  requestDate: request.created,
  requestStatus: request.state,
}));

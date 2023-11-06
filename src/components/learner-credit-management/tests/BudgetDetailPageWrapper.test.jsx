import { useContext } from 'react';
import { Button } from '@edx/paragon';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import BudgetDetailPageWrapper, { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import { getButtonElement } from '../../test/testUtils';

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const defaultStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  },
};

const MockBudgetDetailPageWrapper = ({
  initialStoreState = defaultStoreState,
  children,
}) => {
  const store = getMockStore(initialStoreState);
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <BudgetDetailPageWrapper>
          {children}
        </BudgetDetailPageWrapper>
      </Provider>
    </IntlProvider>
  );
};

describe('<BudgetDetailPageWrapper />', () => {
  it('should render its children and display hero by default', () => {
    render(<MockBudgetDetailPageWrapper><div>hello world</div></MockBudgetDetailPageWrapper>);
    // Verify children are rendered
    expect(screen.getByText('hello world')).toBeInTheDocument();
    // Verify Hero is rendered with the expected page title
    expect(screen.getByText('Learner Credit Management')).toBeInTheDocument();
  });

  it.each([
    { totalLearnersAssigned: 1, expectedLearnerString: 'learner' },
    { totalLearnersAssigned: 2, expectedLearnerString: 'learners' },
  ])('should render Toast notification for successful assignment allocation (%s)', async ({
    totalLearnersAssigned,
    expectedLearnerString,
  }) => {
    const ToastContextController = () => {
      const {
        displayToastForAssignmentAllocation,
        closeToastForAssignmentAllocation,
      } = useContext(BudgetDetailPageContext);

      const handleDisplayToast = () => {
        displayToastForAssignmentAllocation({ totalLearnersAssigned });
      };

      const handleCloseToast = () => {
        closeToastForAssignmentAllocation();
      };

      return (
        <div>
          <Button onClick={handleDisplayToast}>Open Toast</Button>
          <Button onClick={handleCloseToast}>Close Toast</Button>
        </div>
      );
    };
    render(<MockBudgetDetailPageWrapper><ToastContextController /></MockBudgetDetailPageWrapper>);

    const expectedToastMessage = `Course successfully assigned to ${totalLearnersAssigned} ${expectedLearnerString}.`;

    // Open Toast notification
    userEvent.click(getButtonElement('Open Toast'));

    // Verify Toast notification is rendered
    expect(screen.getByText(expectedToastMessage)).toBeInTheDocument();

    // Close Toast notification
    userEvent.click(getButtonElement('Close Toast'));

    // Verify Toast notification is no longer rendered
    await waitFor(() => {
      expect(screen.queryByText(expectedToastMessage)).not.toBeInTheDocument();
    });
  });
});

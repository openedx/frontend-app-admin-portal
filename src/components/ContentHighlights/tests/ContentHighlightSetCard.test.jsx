import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { useStepperModalState } from '../data/hooks';
import ContentHighlightStepper from '../HighlightStepper/ContentHighlightStepper';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';

const mockStore = configureMockStore([thunk]);

const mockData = {
  title: 'Test Title',
  highlightUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
};

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
  highlightUUID: 'test-uuid',
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

/* eslint-disable react/prop-types */
const ContentHighlightSetCardWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) => {
/* eslint-enable react/prop-types */
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = {
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
      <ContentHighlightsContext.Provider value={defaultValue}>
        <Provider store={mockStore(initialState)}>
          <ContentHighlightSetCard {...props} />
          <ContentHighlightStepper isOpen={isModalOpen} />
        </Provider>
      </ContentHighlightsContext.Provider>
    </EnterpriseAppContext.Provider>
  );
};

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...mockData} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the draft status', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...mockData} />);
    fireEvent.click(screen.getByText('Test Title'));
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
});

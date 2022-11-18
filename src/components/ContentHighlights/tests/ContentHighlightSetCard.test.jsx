import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useMemo } from 'react';
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
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: 'test-enterprise-slug',
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
};

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
  highlightSetUUID: 'test-uuid',
};

const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

/* eslint-disable react/prop-types */
function ContentHighlightSetCardWrapper({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  ...props
}) {
/* eslint-enable react/prop-types */
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const defaultValue = useMemo(() => ({
    setIsModalOpen,
    isModalOpen,
  }), [isModalOpen, setIsModalOpen]);
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
}

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper {...mockData} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('Displays the stepper modal on click of the draft status', () => {
    const props = {
      ...mockData,
      isPublished: false,
    };
    renderWithRouter(<ContentHighlightSetCardWrapper {...props} />);
    fireEvent.click(screen.getByText('Test Title'));
    expect(screen.getByText('Create a title for the highlight collection')).toBeInTheDocument();
  });
});

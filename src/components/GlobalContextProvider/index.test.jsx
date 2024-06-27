import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import GlobalContextProvider, { GlobalContext } from './index';

const headerHeightVal = 0;
const footerHeightVal = 0;
const mockDispatch = jest.fn();
const defaultGlobalContextValue = {
  headerHeight: headerHeightVal,
  footerHeight: footerHeightVal,
  minHeight: `calc(100vh - ${headerHeightVal + footerHeightVal + 16}px)`,
  dispatch: mockDispatch,
};

const NestedComponent = () => {
  const { headerHeight, footerHeight, minHeight } = useContext(GlobalContext);
  return (
    <div>
      <div data-testid="headerHeight">{headerHeight}</div>
      <div data-testid="footerHeight">{footerHeight}</div>
      <div data-testid="minHeight">{minHeight}</div>
    </div>
  );
};
const GlobalContextProviderWrapper = ({ children }) => (
  <GlobalContextProvider>
    {children}
  </GlobalContextProvider>
);

describe('GlobalContextProvider', () => {
  it('sets the initial state of the context', () => {
    render(
      <GlobalContextProviderWrapper>
        <NestedComponent />
      </GlobalContextProviderWrapper>,
    );
    const headerHeightTestId = screen.getByTestId('headerHeight');
    const footerHeightTestId = screen.getByTestId('footerHeight');
    const minHeightTestId = screen.getByTestId('minHeight');

    expect(headerHeightTestId.innerHTML).toEqual('0');
    expect(footerHeightTestId.innerHTML).toEqual('0');
    expect(minHeightTestId.innerHTML).toEqual(defaultGlobalContextValue.minHeight);
  });
  it('updates context values', () => {
    const updatedHeaderHeightVal = 25;
    const updatedFooterHeightVal = 30;
    const updatedGlobalContextValue = {
      headerHeight: updatedHeaderHeightVal,
      footerHeight: updatedFooterHeightVal,
      minHeight: `calc(100vh - ${updatedHeaderHeightVal + updatedFooterHeightVal + 16}px)`,
      dispatch: mockDispatch,
    };
    render(
      <GlobalContextProviderWrapper>
        <GlobalContext.Provider value={updatedGlobalContextValue}>
          <NestedComponent />
        </GlobalContext.Provider>
      </GlobalContextProviderWrapper>,
    );
    const headerHeightTestId = screen.getByTestId('headerHeight');
    const footerHeightTestId = screen.getByTestId('footerHeight');
    const minHeightTestId = screen.getByTestId('minHeight');

    expect(headerHeightTestId.innerHTML).toEqual('25');
    expect(footerHeightTestId.innerHTML).toEqual('30');
    expect(minHeightTestId.innerHTML).toEqual(updatedGlobalContextValue.minHeight);
  });
});

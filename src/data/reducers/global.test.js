import { globalReducer } from './global';
import { FOOTER_HEIGHT, HEADER_HEIGHT } from '../constants/global';

const initialState = {
  headerHeight: 0,
  footerHeight: 0,
};

describe('Global Reducer', () => {
  it('Should return the initial state', () => {
    expect(globalReducer(undefined, {})).toEqual(initialState);
  });
  it('Updates the headerHeight', () => {
    const expected = {
      ...initialState,
      headerHeight: 25,
    };
    expect(globalReducer(undefined, {
      type: HEADER_HEIGHT,
      payload: {
        headerHeight: 25,
      },
    })).toEqual(expected);
  });
  it('Updates the footerHeight', () => {
    const expected = {
      ...initialState,
      footerHeight: 35,
    };
    expect(globalReducer(undefined, {
      type: FOOTER_HEIGHT,
      payload: {
        footerHeight: 35,
      },
    })).toEqual(expected);
  });
});

import React from 'react';
import {
  fireEvent, screen, render,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import renderer from 'react-test-renderer';
import { renderWithRouter } from '../../../test/testUtils';
import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from '../../data/constants';

import SettingsLMSTab from '../index';

const initialState = {
  portalConfiguration: {
    enterpriseId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  },
};

// const config = {
//   blackboardBaseUrl: 'http://test.com',
//   clientId: '1234',
//   clientSecret: '1234',
// };

const mockStore = configureMockStore([thunk]);

const SettingsLMSWrapper = () => (
  <Provider store={mockStore({ ...initialState })}>
    <SettingsLMSTab />
  </Provider>
);

describe('<SettingsLMSTab />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SettingsLMSTab />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('has all LMS cards present', () => {
    render(
      <SettingsLMSTab />,
    );
    expect(screen.queryByText(BLACKBOARD_TYPE)).toBeTruthy();
    expect(screen.queryByText(CANVAS_TYPE)).toBeTruthy();
    expect(screen.queryByText(CORNERSTONE_TYPE)).toBeTruthy();
    expect(screen.queryByText(DEGREED_TYPE)).toBeTruthy();
    expect(screen.queryByText(MOODLE_TYPE)).toBeTruthy();
    expect(screen.queryByText(SAP_TYPE)).toBeTruthy();
  });
  test('Blackboard card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const blackboardCard = screen.getByText(BLACKBOARD_TYPE);
    fireEvent.click(blackboardCard);
    expect(screen.queryByText('Connect Blackboard')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Blackboard')).toBeFalsy();
  });
  // test('Blackboard card submit flow', async () => {
  //   jest.mock('../../../../data/services/LmsApiService', () => ({
  //     postNewBlackboardConfig: jest.fn(),
  //   }));
  //   renderWithRouter(<SettingsLMSWrapper />);
  //   const blackboardCard = screen.getByText(BLACKBOARD_TYPE);
  //   fireEvent.click(blackboardCard);

  //   act(() => {
  //     fireEvent.click(blackboardCard);
  //     fireEvent.change(screen.getByLabelText('API Client ID/Blackboard Application Key'), {
  //       target: { value: 'test1' },
  //     });
  //     fireEvent.change(screen.getByLabelText('API Client Secret/Application Secret'), {
  //       target: { value: 'test2' },
  //     });
  //     fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
  //       target: { value: 'test3' },
  //     });
  //     const submitButton = screen.getByRole('button', { name: 'Submit' });
  //     fireEvent.click(submitButton);

  //     // const noError = '';

  //     // const spy = jest.spyOn(updateBlackboardConfig, 'updateBlackboardConfig');
  //     // spy.mockReturnValue(noError);

  //     // await handle

  //     // screen.debug();
  //     // spy.mockRestore();

  //     // const formData = new FormData();
  //     // REQUIRED_BLACKBOARD_CONFIG_FIELDS.forEach((
  // requiredField) => formData.append(requiredField, config[requiredField]));

  //     // const mockUpdateBlackboardConfig = jest.spyOn(
  // wrapper.instance(), 'updateBlackboardConfig').mockImplementation(() => {});
  //     // await wrapper.instance().handleSubmit(formData, config);
  //     // expect(mockUpdateBlackboardConfig).toHaveBeenCalled();

  //   })

  // });
  test('Canvas card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const canvasCard = screen.getByText(CANVAS_TYPE);
    fireEvent.click(canvasCard);
    expect(screen.queryByText('Connect Canvas')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Canvas')).toBeFalsy();
  });
  test('Cornerstone card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const cornerstoneCard = screen.getByText(CORNERSTONE_TYPE);
    fireEvent.click(cornerstoneCard);
    expect(screen.queryByText('Connect Cornerstone')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Cornerstone')).toBeFalsy();
  });
  test('Degreed card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const degreedCard = screen.getByText(DEGREED_TYPE);
    fireEvent.click(degreedCard);
    expect(screen.queryByText('Connect Degreed')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Degreed')).toBeFalsy();
  });
  test('Moodle card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const moodleCard = screen.getByText(MOODLE_TYPE);
    fireEvent.click(moodleCard);
    expect(screen.queryByText('Connect Moodle')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Moodle')).toBeFalsy();
  });
  test('SAP card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(SAP_TYPE);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect SAP')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect SAP')).toBeFalsy();
  });
});

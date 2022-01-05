import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsAccessTabSection from '../SettingsAccessTabSection';

const generateProps = ({
  checked,
  onFormSwitchChange,
  onCollapsibleToggle,
}) => ({
  title: 'toggle me',
  children: 'hide me',
  checked,
  onFormSwitchChange,
  onCollapsibleToggle,
});

describe('<SettingsAccessTabSection />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking Form.Switch ', async () => {
    const changeSpy = jest.fn();
    const props = generateProps({
      checked: true,
      onFormSwitchChange: changeSpy,
      onCollapsibleToggle: () => {},
    });
    render(<SettingsAccessTabSection {...props} />);
    expect(screen.queryByText(props.children)).toBeTruthy();
    // click on form.switch
    const enableSwitch = screen.getByText('Enable', { exact: false });
    await act(async () => { userEvent.click(enableSwitch); });
    expect(changeSpy).toBeCalledTimes(1);
  });

  describe('Clicking title', () => {
    it('with onCollapsibleToggle', async () => {
      const toggleSpy = jest.fn();
      const props = generateProps({
        checked: true,
        onFormSwitchChange: () => {},
        onCollapsibleToggle: toggleSpy,
      });
      // is open by default
      render(<SettingsAccessTabSection {...props} />);
      // click on collapsible title
      const titleArea = screen.getByText(props.title);
      await act(async () => { userEvent.click(titleArea); });
      // wait till its gone and assert
      await waitForElementToBeRemoved(() => screen.queryByText(props.children));
      expect(screen.queryByText(props.children)).toBeFalsy();
      expect(toggleSpy).toBeCalledTimes(1);
    });

    it('without onCollapsibleToggle', async () => {
      const toggleSpy = jest.fn();
      const props = generateProps({
        checked: true,
        onFormSwitchChange: toggleSpy,
      });
      // is open by default
      render(<SettingsAccessTabSection {...props} />);
      // click on collapsible title
      const titleArea = screen.getByText(props.title);
      await act(async () => { userEvent.click(titleArea); });
      // wait till its gone and assert
      await waitForElementToBeRemoved(() => screen.queryByText(props.children));
      expect(screen.queryByText(props.children)).toBeFalsy();
      expect(toggleSpy).toBeCalledTimes(0);
    });
  });
});

import React from 'react';
import { shallow, mount } from 'enzyme';
import MoodleIntegrationConfigForm, { REQUIRED_MOODLE_CONFIG_FIELDS } from './MoodleIntegrationConfigForm';

const formData = new FormData();
REQUIRED_MOODLE_CONFIG_FIELDS.forEach(field => formData.append(field, 'testdata'));

describe('<MoodleIntegrationConfigForm />', () => {
  it('validation fails if required fields missing', () => {
    const invalidFormData = new FormData();
    const wrapper = shallow(<MoodleIntegrationConfigForm enterpriseId="testing123" />);
    const invalidFields = wrapper.instance().validateMoodleConfigForm(
      invalidFormData,
      REQUIRED_MOODLE_CONFIG_FIELDS,
    );
    expect(Object.keys(invalidFields)).toEqual(REQUIRED_MOODLE_CONFIG_FIELDS);
  });

  it('submit fails validation if creds are missing/duplicated from form', () => {
    const wrapper = mount((
      <MoodleIntegrationConfigForm enterpriseId="testing123" />
    ));
    // Case 1: No creds at all
    wrapper.instance().handleSubmit(formData);
    expect(wrapper.state().invalidFields).toEqual({ username: true, password: true });
    // Case 2: Username but no password
    formData.append('username', 'testingface');
    wrapper.instance().handleSubmit(formData);
    expect(wrapper.state().invalidFields).toEqual({ password: true });
    // Case 3: Too many creds (aka username/password AND token)
    formData.append('token', 'lkkrjtflwkerjrg');
    formData.append('password', 'lkwerjgtlwkje');
    wrapper.instance().handleSubmit(formData);
    expect(wrapper.state().invalidFields).toEqual({ duplicateCreds: true });
  });

  it('submit calls createMoodleConfig when config is not present', () => {
    const wrapper = mount((
      <MoodleIntegrationConfigForm enterpriseId="testing123" />
    ));
    const spyCreate = jest.spyOn(wrapper.instance(), 'createMoodleConfig');
    formData.delete('username');
    formData.delete('password');
    wrapper.instance().handleSubmit(formData);
    expect(spyCreate).toHaveBeenCalledWith(formData);
  });

  it('submit calls updateMoodleConfig when config is present', () => {
    const config = {
      id: 1,
      active: true,
      moodleBaseUrl: 'testing.com',
      serviceShortName: 'test',
      categoryId: 1,
      token: 'rwlketfjhwlkegj',
    };
    const wrapper = mount((
      <MoodleIntegrationConfigForm enterpriseId="testing123" config={config} />
    ));
    const spyUpdate = jest.spyOn(wrapper.instance(), 'updateMoodleConfig');
    wrapper.instance().handleSubmit(formData, config);
    expect(spyUpdate).toHaveBeenCalledWith(formData, config.id);
  });
});

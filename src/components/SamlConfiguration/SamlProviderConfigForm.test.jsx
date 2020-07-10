import React from 'react';
import { shallow, mount } from 'enzyme';
import SamlProviderConfigForm, { REQUIRED_CONFIG_FIELDS } from './SamlProviderConfigForm';

const createProviderConfig = jest.fn();
const updateProviderConfig = jest.fn();

const formData = new FormData();
REQUIRED_CONFIG_FIELDS.forEach(field => formData.append(field, 'testdata'));

describe('<SamlProviderConfigForm />', () => {
  it('validation fails if required fields are missing', () => {
    const invalidFormData = new FormData();

    const wrapper = shallow(<SamlProviderConfigForm />);
    const invalidFields = wrapper.instance().validateProviderConfigForm(
      invalidFormData,
      REQUIRED_CONFIG_FIELDS,
    );
    expect(Object.keys(invalidFields)).toEqual(REQUIRED_CONFIG_FIELDS);
  });

  it('submit calls createProviderConfig when config is not present', () => {
    const wrapper = mount((
      <SamlProviderConfigForm
        createProviderConfig={createProviderConfig}
      />
    ));
    wrapper.instance().handleSubmit(formData);
    expect(createProviderConfig).toHaveBeenCalledWith(formData);
  });
  it('submit calls updateProviderConfig when config is present', () => {
    const config = {
      entityId: 'blargh',
      id: 1,
      metadataSource: 'wobsite',
    };

    const wrapper = mount((
      <SamlProviderConfigForm
        createProviderConfig={createProviderConfig}
        updateProviderConfig={updateProviderConfig}
      />
    ));

    wrapper.instance().handleSubmit(formData, config);
    expect(updateProviderConfig).toHaveBeenCalled();
  });
});

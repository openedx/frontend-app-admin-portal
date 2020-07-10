import React from 'react';
import { shallow, mount } from 'enzyme';
import SamlProviderDataForm, { REQUIRED_DATA_FIELDS } from './SamlProviderDataForm';

const createProviderData = jest.fn();

const formData = new FormData();
REQUIRED_DATA_FIELDS.forEach(field => formData.append(field, 'testdata'));

describe('<SamlProviderDataForm />', () => {
  it('validation fails if required fields are missing', () => {
    const invalidFormData = new FormData();

    const wrapper = shallow(<SamlProviderDataForm />);
    const invalidFields = wrapper.instance().validateProviderDataForm(
      invalidFormData,
      REQUIRED_DATA_FIELDS,
    );
    expect(Object.keys(invalidFields)).toEqual(REQUIRED_DATA_FIELDS);
  });

  it('submit calls createProviderData', () => {
    const wrapper = mount((
      <SamlProviderDataForm
        createProviderData={createProviderData}
      />
    ));
    wrapper.instance().handleSubmit(formData);
    expect(createProviderData).toHaveBeenCalledWith(formData);
  });
  it('submit is disabled when config is present', () => {
    const config = {
      id: 1,
    };
    REQUIRED_DATA_FIELDS.forEach((field) => { config[field] = 'testdata'; });

    const wrapper = mount((
      <SamlProviderDataForm
        config={config}
        createProviderData={createProviderData}
      />
    ));

    expect(wrapper.find('input#ssoUrl').props().value).toEqual('testdata');
  });
});

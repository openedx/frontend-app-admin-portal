import React from 'react';
import { shallow, mount } from 'enzyme';
import SamlProviderDataForm, { REQUIRED_DATA_FIELDS } from './SamlProviderDataForm';

const createProviderData = jest.fn();
const deleteEnabled = false;

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

  it('submit is rendered and calls createProviderData', () => {
    const wrapper = mount((
      <SamlProviderDataForm
        createProviderData={createProviderData}
        deleteEnabled={deleteEnabled}
      />
    ));
    expect(wrapper.exists('#submitButton')).toEqual(true);
    wrapper.instance().handleSubmit(formData);
    expect(createProviderData).toHaveBeenCalledWith(formData);
  });
  it('fields disabled/submit not rendered when provider data is present', () => {
    const data = {
      id: 1,
    };
    REQUIRED_DATA_FIELDS.forEach((field) => { data[field] = 'testdata'; });
    const wrapper = mount((
      <SamlProviderDataForm
        pData={data}
        deleteEnabled={deleteEnabled}
        createProviderData={createProviderData}
      />
    ));
    REQUIRED_DATA_FIELDS.forEach((field) => {
      if (field === 'publicKey') {
        expect(wrapper.find('textarea#publicKey').props().defaultValue).toEqual('testdata');
        expect(wrapper.find('textarea#publicKey').props().disabled).toEqual(true);
      } else {
        expect(wrapper.find(`input#${field}`).props().defaultValue).toEqual('testdata');
        expect(wrapper.find(`input#${field}`).props().disabled).toEqual(true);
      }
      expect(wrapper.exists('#submitButton')).toEqual(false);
    });
  });
});

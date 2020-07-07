import React from 'react';
import { mount } from 'enzyme';
import SamlProviderConfigForm from './SamlProviderConfigForm';

const createProviderConfig = () => {};

// Enzyme changes the submit target, so it ends up as the button, not the form data contained
// so this is failing. Will fix later.
describe('<SamlProviderConfigForm />', () => {
  it('does not submit if entityId is missing', () => {
    const wrapper = mount((
      <SamlProviderConfigForm
        createProviderConfig={createProviderConfig}
      />
    ));
    wrapper.find('input#metadataSource').instance().value = 'http://test.testingface.com/metadata.xml';
    wrapper.find('button#submitButton').simulate('click');
    expect(wrapper.find('input#entityId').hasClass('is-invalid')).toBeTruthy();
  });
});

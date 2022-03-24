import {
  updateCurrentstep,
  updateIdpEntryTypeAction,
  updateIdpMetadataURLAction,
  updateServiceProviderConfigured,
} from './actions';
import SSOStateReducer from './reducer';

describe('reducer sso tests', () => {
  test('adds metadataURL', () => {
    expect(SSOStateReducer({}, updateIdpMetadataURLAction('aTestURL'))).toStrictEqual({
      idp: { metadataURL: 'aTestURL', isDirty: true },
    });
  });

  test('overwrites metadataURL', () => {
    expect(SSOStateReducer({
      idp: {
        metadataURL: 'oldOne',
      },
    }, updateIdpMetadataURLAction('aTestURL'))).toStrictEqual({
      idp: { metadataURL: 'aTestURL', isDirty: true },
    });
  });
  test('overwrites metadataURL', () => {
    expect(SSOStateReducer({
      idp: {
        metadataURL: 'a',
        entryType: 'oldOne',
      },
    }, updateIdpEntryTypeAction('typeII'))).toStrictEqual({
      idp: { metadataURL: 'a', entryType: 'typeII', isDirty: true },
    });
  });
  test('overwrites currentStep', () => {
    expect(SSOStateReducer({
      currentStep: 'abc',
      idp: {
        metadataURL: 'a',
        entryType: 'oldOne',
      },
    }, updateCurrentstep('aGiantLeapForMankind'))).toStrictEqual({
      idp: { metadataURL: 'a', entryType: 'oldOne' },
      currentStep: 'aGiantLeapForMankind',
    });
  });
  test('overwrites isSPConfigured', () => {
    expect(SSOStateReducer({
      serviceprovider: { isSPConfigured: false },
      currentStep: 'abc',
    }, updateServiceProviderConfigured(true))).toStrictEqual({
      serviceprovider: { isSPConfigured: true },
      currentStep: 'abc',
    });
  });
});

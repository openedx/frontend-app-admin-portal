import {
  updateConnectIsSsoValid,
  updateCurrentError,
  updateCurrentStep,
  updateEntityIDAction,
  updateIdpDirtyState,
  updateIdpEntryTypeAction,
  updateIdpMetadataURLAction,
  updateInfoMessage,
  updateServiceProviderConfigured,
  updateStartTime,
} from './actions';
import SSOStateReducer from './reducer';

describe('reducer sso tests', () => {
  test('adds metadataURL', () => {
    expect(SSOStateReducer({}, updateIdpMetadataURLAction('aTestURL'))).toStrictEqual({
      idp: { metadataURL: 'aTestURL', isDirty: true },
    });
  });

  test('adds infoMessage', () => {
    const infoMessage = 'sdf;akjsdf;klj';
    expect(SSOStateReducer({}, updateInfoMessage(infoMessage))).toStrictEqual({
      infoMessage,
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
  test('overwrites entryType', () => {
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
    }, updateCurrentStep('aGiantLeapForMankind'))).toStrictEqual({
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
  test('overwrites isSPConfigured and isSsoValid', () => {
    expect(SSOStateReducer({
      serviceprovider: { isSPConfigured: false },
      currentStep: 'abc',
    }, updateConnectIsSsoValid(true))).toStrictEqual({
      serviceprovider: { isSPConfigured: true },
      currentStep: 'abc',
      connect: { isSsoValid: true },
    });
  });
  test('overwrites connect.startTime', () => {
    expect(SSOStateReducer({
      connect: { isSsoValid: true, startTime: undefined },
    }, updateStartTime(100))).toStrictEqual({
      connect: { isSsoValid: true, startTime: 100 },
    });
  });
  test('overwrites dirty state for idp', () => {
    expect(SSOStateReducer({
      idp: { isDirty: false },
    }, updateIdpDirtyState(true))).toStrictEqual({
      idp: { isDirty: true },
    });
  });
  test('overwrites entityid in idp', () => {
    expect(SSOStateReducer({
      idp: { entityID: 'abc' },
    }, updateEntityIDAction('a-new-entity-id'))).toStrictEqual({
      idp: { entityID: 'a-new-entity-id', isDirty: true },
    });
  });
  test('overwrites currentError', () => {
    const anError = Error('test');
    expect(SSOStateReducer({
      currentError: null,
    }, updateCurrentError(anError))).toStrictEqual({
      currentError: anError,
    });
  });
});

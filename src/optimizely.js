export const EVENTS = {};

export const getActiveExperiments = () => {
  if (!window.optimizely) {
    return [];
  }
  return window.optimizely.get('state').getActiveExperimentIds();
};

export const getVariationMap = () => {
  if (!window.optimizely) {
    return false;
  }
  return window.optimizely.get('state').getVariationMap();
};

export const pushUserAttributes = (userAttributes) => {
  if (!window.optimizely) {
    return;
  }
  window.optimizely.push({
    type: 'user',
    attributes: userAttributes,
  });
};

export const pushEvent = (eventName, eventMetadata) => {
  if (!window.optimizely) {
    return;
  }
  window.optimizely.push({
    type: 'event',
    eventName,
    tags: eventMetadata,
  });
};

export const pushUserCustomerAttributes = ({ uuid, slug }) => {
  pushUserAttributes({
    enterpriseCustomerUuid: uuid,
    enterpriseCustomerSlug: slug,
  });
};

export const isExperimentActive = (experimentId) => getActiveExperiments().includes(experimentId);

export const isExperimentVariant = (experimentId, variantId) => {
  if (!isExperimentActive(experimentId)) {
    return false;
  }
  const selectedVariant = getVariationMap()[experimentId];
  return selectedVariant?.id === variantId;
};

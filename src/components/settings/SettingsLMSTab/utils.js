export default function buttonBool(config) {
  let returnVal = true;
  Object.entries(config).forEach(entry => {
    const [key, value] = entry;
    // check whether or not the field is an optional value
    if ((key !== 'displayName' && key !== 'degreedFetchUrl') && !value) {
      returnVal = false;
    }
  });
  return returnVal;
}

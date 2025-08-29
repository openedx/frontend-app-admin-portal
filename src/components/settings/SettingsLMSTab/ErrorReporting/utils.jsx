import * as timeago from 'timeago.js';
import { Hyperlink, OverlayTrigger, Popover } from '@openedx/paragon';
import { CheckCircle, Error, Sync } from '@openedx/paragon/icons';

timeago.register('time-locale');
/**
 * Transforms an array to a dictionary of objects allowing for custom key lookup and value transformations
 *
 * Paramaters:
 * source (array): The array which is to be transformed
 * lookupFunc (func): Function that generates string keys for the object
 * valueTransformation (func): Function that transforms and generates string values for the object
 */
export function createLookup(source, lookupFunc, valueTransformation) {
  const newFiltersMap = source.map((item) => ({ [lookupFunc(item)]: valueTransformation(item) }));
  return Object.assign({}, ...newFiltersMap);
}

export function isStrictlyArray(data) {
  return !Array.isArray(data) || !data.every((p) => typeof p === 'object' && p !== null);
}

export function getSyncStatus(status, statusMessage) {
  return (
    <>
      {status === 'okay' && (<><CheckCircle className="text-success-600 mr-2" />Success</>)}
      {status === 'pending' && (<><Sync className="mr-2" />Pending</>)}
      {status === 'error' && (
      <>
        <Error className="text-danger-500 mr-2" />
        Error
        <OverlayTrigger
          trigger="click"
          key="error-popover"
          placement="bottom"
          rootClose
          overlay={(
            <Popover variant="danger" id="error-popover">
              <Popover.Content>
                <h5 className="mb-2"><Error className="text-danger-500 mr-1" />Error<br /></h5>
                {statusMessage || 'Something went wrong.  Please contact enterprise customer support.'}
              </Popover.Content>
            </Popover>
      )}
        ><Hyperlink className="ml-3" style={{ cursor: 'pointer' }}><u>Read</u></Hyperlink>
        </OverlayTrigger>
      </>
      )}

    </>
  );
}

export function getTimeAgo(time) {
  if (!time) {
    return null;
  }
  return <div>{timeago.format(time, 'time-locale')}</div>;
}

import * as timeago from 'timeago.js';
import {
  CheckCircle, Error, Sync,
} from '@edx/paragon/icons';

timeago.register('time-locale');

export function isStrictlyArray(data) {
  return !Array.isArray(data) || !data.every((p) => typeof p === 'object' && p !== null);
}

export function getSyncStatus(status) {
  return (
    <>
      {status === 'okay' && (<><CheckCircle className="text-success-600 mr-2" />Success</>)}
      {status === 'error' && (<><Error className="text-danger-500 mr-2" /> Error</>)}
      {status === 'pending' && (<><Sync className="mr-2" /> Pending</>)}
    </>
  );
}

export function getSyncTime(time) {
  return (<>{time !== null && (<div>{timeago.format(time, 'time-locale')}</div>)}</>);
}

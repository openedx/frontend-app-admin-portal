import * as timeago from 'timeago.js';
import {
  Hyperlink, OverlayTrigger, Popover,
} from '@edx/paragon';
import {
  CheckCircle, Error, Sync,
} from '@edx/paragon/icons';

timeago.register('time-locale');

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
                {statusMessage}
              </Popover.Content>
            </Popover>
      )}
        ><Hyperlink className="ml-3"><u>Read</u></Hyperlink>
        </OverlayTrigger>
      </>
      )}

    </>
  );
}

export function getSyncTime(time) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (<>{time !== null && (<div>{timeago.format(time, 'time-locale')}</div>)}</>);
}

import { NOTIFICATION_ENDPOINT } from '../../../config';

export function callNotificationApi(path: string) {
  return fetch(NOTIFICATION_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ uploaded: path }),
  }).then((res) => res.json());
}

export function callNotificationApi(path: string) {
  return fetch('http://localhost:3000/notify', {
    method: 'POST',
    body: JSON.stringify({ uploaded: path }),
  }).then((res) => res.json());
}

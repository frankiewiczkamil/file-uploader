import { FETCH_DESTINATION_ENDPOINT } from '../../../config';

export function fetchDestinationPath() {
  return fetch(FETCH_DESTINATION_ENDPOINT).then((res) => res.json());
}

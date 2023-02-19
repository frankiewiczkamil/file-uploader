export function fetchDestinationPath() {
  return fetch('http://localhost:3000/path').then((res) => res.json());
}

export function getSessionStorage(name) {
  // Use a try in case it gets blocked
  try {
    return sessionStorage[name];
  } catch(e) {
    return null;
  }
}

export function setSessionStorage(name, value) {
  // Use a try in case it gets blocked
  try {
    sessionStorage[name] = value;
  } catch(e) {}
}
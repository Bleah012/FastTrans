const authStorageKey = "fasttrans_auth_user";

export function saveAuthUser(user) {
  localStorage.setItem(authStorageKey, JSON.stringify(user));
}

export function getAuthUser() {
  const savedUser = localStorage.getItem(authStorageKey);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem(authStorageKey);
    return null;
  }
}

export function getAuthToken() {
  const user = getAuthUser();
  return user?.token || "";
}

export function isAdminUser() {
  const user = getAuthUser();
  return user?.role === "admin" || user?.role === "manager";
}

export function logoutUser() {
  localStorage.removeItem(authStorageKey);
}

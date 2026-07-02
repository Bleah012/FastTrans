const AUTH_STORAGE_KEY = "fasttrans-auth-user";

export function saveAuthUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser() {
  const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return getAuthUser()?.token || "";
}

export function isAdminUser() {
  const user = getAuthUser();

  return user?.role === "admin" || user?.role === "manager";
}

export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

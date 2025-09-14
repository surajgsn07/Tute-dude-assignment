import Cookies from "universal-cookie";

const cookies = new Cookies();

export const setCookieItem = (key, value, expiryInHours) => {
  const options = { path: "/" };
  if (expiryInHours) {
    const expires = new Date();
    expires.setHours(expires.getHours() + expiryInHours);
    options.expires = expires;
  }
  cookies.set(key, value, options);
};

export const getCookieItem = (key) => {
  return cookies.get(key) || null;
};

export const removeCookieItem = (key) => {
  cookies.remove(key, { path: "/" });
};

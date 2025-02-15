export function setCookie(name: string, value: string, days: number) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.startsWith(nameEQ)) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting cookie:", error);
    return null;
  }
}

export function deleteCookie(name: string) {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  } catch (error) {
    console.error("Error deleting cookie:", error);
  }
}

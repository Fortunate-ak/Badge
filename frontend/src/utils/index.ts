// frontend/src/utils/index.ts

/**
 * Retrieves a cookie value by its name.
 * @param name The name of the cookie to retrieve.
 * @returns The cookie value or null if not found.
 */
export function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * A custom fetch function that includes credentials and CSRF token for relevant requests.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns A promise that resolves to the response.
 */
export async function customFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Add credentials to all requests
  options.credentials = 'include';

  // Add CSRF token for methods that require it
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method?.toUpperCase() || '')) {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      const headers = new Headers(options.headers);
      headers.set('X-CSRFToken', csrftoken);
      options.headers = headers;
    }
  }

  return fetch(url, options);
}

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



export function timeAgo(input: Date | string | number): string {
  const now = new Date();
  const date = new Date(input);

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds)) {
    throw new Error("Invalid date passed to timeAgo()");
  }

  const intervals: { label: string; seconds: number }[] = [
    { label: "year", seconds: 365 * 24 * 60 * 60 },
    { label: "month", seconds: 30 * 24 * 60 * 60 },
    { label: "week", seconds: 7 * 24 * 60 * 60 },
    { label: "day", seconds: 24 * 60 * 60 },
    { label: "hour", seconds: 60 * 60 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}


export function timeLeft(input: Date | string | number): string {
  console.log("Tiem Left", input)
  const now = new Date();
  const date = new Date(input);

  const seconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (isNaN(seconds)) {
    throw new Error("Invalid date passed to timeAgo()");
  }

  const intervals: { label: string; seconds: number }[] = [
    { label: "year", seconds: 365 * 24 * 60 * 60 },
    { label: "month", seconds: 30 * 24 * 60 * 60 },
    { label: "week", seconds: 7 * 24 * 60 * 60 },
    { label: "day", seconds: 24 * 60 * 60 },
    { label: "hour", seconds: 60 * 60 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} left`;
    }
  }

  return "just now";
}
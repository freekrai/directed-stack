//import isIP from "is-ip";
import { getHeaders } from "~/utils/trenta/get-headers";

/**
 * This is the list of headers, in order of preference, that will be used to
 * determine the client's IP address.
 */
const headerNames = Object.freeze([
  "X-Client-IP",
  "X-Forwarded-For",
  "HTTP-X-Forwarded-For",
  "Fly-Client-IP",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
  "DO-Connecting-IP" /** Digital ocean app platform */,
  "oxygen-buyer-ip" /** Shopify oxygen platform */,
] as const);

const checkIPv4 = (s: string) => {
  // Count the occurrence of '.' in the given string
  let cnt = s.split('.').length - 1;
 
  // Not a valid IP address
  if (cnt !== 3) {
    return false;
  }
 
  // Split the string into tokens
  let tokens = s.split('.');
 
  if (tokens.length !== 4) {
    return false;
  }
 
  // Check if all the tokenized strings
  // lie in the range [0, 255]
  for (let token of tokens) {
    // Base Case
    if (token === "0") {
      continue;
    }
 
    if (token.length === 0) {
      return false;
    }
 
    // Check if the tokenized string is a number
    if (!/^\d+$/.test(token)) {
      return false;
    }
 
    // Range check for the number
    if (parseInt(token) > 255 || parseInt(token) < 0) {
      return false;
    }
  }
 
  return true;
}
 
 
// Function to check if the string
// represents a hexadecimal number
const checkHex = (s: string) => {
  // Check if the string is a valid hexadecimal number
  return /^[0-9a-fA-F]+$/.test(s);
}
 
// Function to check if the given
// string S is IPv6 or not
const checkIPv6 = (s: string) => {
  // Count the occurrence of ':' in the given string
  let cnt = s.split(':').length - 1;
 
  // Not a valid IP Address
  if (cnt !== 7) {
    return false;
  }
 
  // Split the string into tokens
  let tokens = s.split(':');
 
  if (tokens.length !== 8) {
    return false;
  }
 
  // Check if all the tokenized strings
  // are in hexadecimal format
  for (let token of tokens) {
    // Check if the tokenized string is a valid hexadecimal number
    if (!checkHex(token) || token.length > 4 || token.length < 1) {
      return false;
    }
  }
 
  return true;
}
 
const isIP = (ip: string) => {
  // Check if the string is IPv4
  if (checkIPv4(ip)) {
    return true;
  } else if (checkIPv6(ip)) {
    return true;
  }
  return false;
}

/**
 * Get the IP address of the client sending a request.
 *
 * It receives the Request object or the headers object and use it to get the
 * IP address from one of the following headers in order.
 *
 * - X-Client-IP
 * - X-Forwarded-For
 * - HTTP-X-Forwarded-For
 * - Fly-Client-IP
 * - CF-Connecting-IP
 * - Fastly-Client-Ip
 * - True-Client-Ip
 * - X-Real-IP
 * - X-Cluster-Client-IP
 * - X-Forwarded
 * - Forwarded-For
 * - Forwarded
 * - DO-Connecting-IP
 * - oxygen-buyer-ip
 *
 * If the IP address is valid, it will be returned. Otherwise, null will be
 * returned.
 *
 * If the header values contains more than one IP address, the first valid one
 * will be returned.
 */
export function getClientIPAddress(headers: Headers): string | null;
export function getClientIPAddress(request: Request): string | null;
export function getClientIPAddress(
  requestOrHeaders: Request | Headers
): string | null {
  let headers = getHeaders(requestOrHeaders);

  let ipAddress = headerNames
    .flatMap((headerName) => {
      let value = headers.get(headerName);
      if (headerName === "Forwarded") {
        return parseForwardedHeader(value);
      }
      if (!value?.includes(",")) return value;
      return value.split(",").map((ip) => ip.trim());
    })
    .find((ip) => {
      if (ip === null) return false;
      return isIP(ip);
    });

  return ipAddress ?? null;
}

function parseForwardedHeader(value: string | null): string | null {
  if (!value) return null;
  for (let part of value.split(";")) {
    if (part.startsWith("for=")) return part.slice(4);
    continue;
  }
  return null;
}
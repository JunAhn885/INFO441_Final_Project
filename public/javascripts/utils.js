"use strict";

/**
 * Gets a DOM element with the specified ID.
 * @param {string} id The ID of the element.
 * @returns {HTMLElement} The element with the specified ID.
 */
export function id(id) {
  return document.getElementById(id);
}

export function escapeHtml(str) {
  return !str ? str : str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
}

export async function fetchJSON(route, options) {
  let response
  try {
    response = await fetch(route, {
      method: options && options.method ? options.method : "GET",
      body: options && options.body ? JSON.stringify(options.body) : undefined,
      headers: options && options.body ? { 'Content-Type': 'application/json' } : undefined
    })
  } catch (error) {
    displayError()
    throw new Error(
      `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
         No response from server (failed to fetch)`)
  }
  let responseJson;
  try {
    responseJson = await response.json();
  } catch (error) {
    try {
      let responseText = await response.text();
    } catch (getTextError) {
      displayError()
      throw new Error(
        `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
            Status: ${response.status}
            Couldn't get response body
            error: ${getTextError}`)
    }
    displayError()
    throw new Error(
      `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
        Status: ${response.status}
        Response wasn't json: ${responseText ? JSON.stringify(responseText) : responseText}
        error: ${getTextError}`)
  }
  if (response.status < 200 || response.status >= 300 || responseJson.status == "error") {
    displayError()
    throw new Error(
      `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
        Status: ${response.status}
        Response: ${responseJson ? JSON.stringify(responseJson) : responseJson}`)
  }
  return responseJson
}

async function displayError() {
  document.getElementById('errorInfo').innerText = 'Error: action failed (see console for more information)'
  document.getElementById('errorInfo').style.opacity = 1
  // pause 4 seconds
  await new Promise(resolve => setTimeout(resolve, 4 * 1000))
  document.getElementById('errorInfo').innerText = ''
  document.getElementById('errorInfo').style.opacity = 0
}

/**
 * Human readable elapsed or remaining time (example: 3 minutes ago)
 * @param  {Date|Number|String} date A Date object, timestamp or string parsable with Date.parse()
 * @param  {Date|Number|String} [nowDate] A Date object, timestamp or string parsable with Date.parse()
 * @param  {Intl.RelativeTimeFormat} [trf] A Intl formater
 * @return {string} Human readable elapsed or remaining time
 * @author github.com/victornpb
 * @see https://stackoverflow.com/a/67338038/938822
 */
export function fromNow(
    date, nowDate = Date.now(),
    rft = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })) {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  const intervals = [
    { ge: YEAR, divisor: YEAR, unit: 'year' },
    { ge: MONTH, divisor: MONTH, unit: 'month' },
    { ge: WEEK, divisor: WEEK, unit: 'week' },
    { ge: DAY, divisor: DAY, unit: 'day' },
    { ge: HOUR, divisor: HOUR, unit: 'hour' },
    { ge: MINUTE, divisor: MINUTE, unit: 'minute' },
    { ge: 30 * SECOND, divisor: SECOND, unit: 'seconds' },
    { ge: 0, divisor: 1, text: 'just now' },
  ];
  const now = typeof nowDate === 'object' ? nowDate.getTime() : new Date(nowDate).getTime();
  const diff = now - (typeof date === 'object' ? date : new Date(date)).getTime();
  const diffAbs = Math.abs(diff);
  for (const interval of intervals) {
    if (diffAbs >= interval.ge) {
      const x = Math.round(Math.abs(diff) / interval.divisor);
      const isFuture = diff < 0;
      return interval.unit ? rft.format(isFuture ? x : -x, interval.unit) : interval.text;
    }
  }
}

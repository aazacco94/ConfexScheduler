/*
 * Functions used for connecting with the back-end.
 */

import endpoints from '../config/api-config';
import { queryFormatter } from './helpers';

/**
 * Builds the API request and injects auth token.
 *
 * @param endpoint the api endpoint
 * @param method an http method: 'GET', 'POST', ...
 * @param body a json object as a string for the request body
 * @returns {Promise<any>} resolves to the json response or an error
 */
async function authenticatedCall(endpoint, method, body = null) {
  // const accessToken = await firebaseAuth.currentUser.getIdToken();
  // console.log(`Current user: ${firebaseAuth.currentUser.uid}`);
  const init = {
    headers: {
      // Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    method,
    body,
  };
  return fetch(endpoint, init)
    .then(res => {
      if (!res.ok) {
        throw new Error('API error');
      }
      return res.json();
    }).catch(err => err);
}

function initialUpload(sessionArray) {
  const jsonBody = JSON.stringify(sessionArray);
  return authenticatedCall(endpoints.uploadAll, 'POST', jsonBody);
}

function downloadMongoData() {
  return authenticatedCall(endpoints.outputSchedule, 'GET');
}

function getAVOptions() {
  return authenticatedCall(endpoints.avOptions, 'GET');
}

/**
 * Fetches all properties or a specified list of properties.
 * @param {String[]} [properties] an array of property names to find
 * @returns {Promise<Array>} a list of properties
 */
function getHotels(properties) {
  const url = new URL(endpoints.hotels);
  if (properties) {
    properties.forEach(p => {
      url.searchParams.append('properties', p);
    });
  }
  return authenticatedCall(url, 'GET');
}

/**
 * Deletes hotels when there are no scheduled rooms.
 * @param {String[]} [properties] property names to delete
 * @returns {Promise<Array>} a list of properties that could not be deleted
 */
function deleteHotels(properties) {
  const url = new URL(endpoints.hotels);
  properties.forEach(p => {
    url.searchParams.append('properties', p);
  });
  console.log(url.toString());
  return authenticatedCall(url, 'DELETE');
}

function getHotelOptions() {
  return authenticatedCall(endpoints.roomHotelOptions, 'GET');
}

function storeConferenceTimes(date) {
  const endpoint = `${endpoints.conferenceTimes}?start=${date.startDate}&end=${date.endDate}`;
  return authenticatedCall(endpoint, 'POST');
}

function getConferenceTimes() {
  return authenticatedCall(endpoints.getConferenceTimes, 'GET');
}

function getFilterOptionSessions() {
  return authenticatedCall(endpoints.sessionFilterOptions, 'GET');
}

function filterRooms(payload) {
  const jsonBody = JSON.stringify(payload);
  return authenticatedCall(endpoints.filter.rooms, 'POST', jsonBody);
}

function sendAllForScheduling(payload) {
  const jsonBody = JSON.stringify(payload);
  return authenticatedCall(endpoints.storeScheduleSessions, 'POST', jsonBody);
}

//returns the sessions that are filtered based on the userInput.
function filterSessions(userInput) {
  const payload = JSON.stringify(userInput);
  const url = `${endpoints.filter.sessions}`;
  return authenticatedCall(url, 'POST', payload);
}

function filterDates(userInput) {
  const time = queryFormatter(userInput.times, 'time');
  const date = queryFormatter(userInput.weekdays, 'date');
  const url = `${endpoints.filter.dates}?${date}&${time}`;
  return authenticatedCall(url, 'GET');
}

function purgeDb(dbType) {
  //return APIdelcall(`${endpoints.purgeDb}/${dbType}`);
  const url = `${endpoints.purgeDb}/${dbType}`;
  //console.log(url);
  return authenticatedCall(url, 'DELETE');
}

function outputSchedule() {
  const url = endpoints.outputSchedule;
  return authenticatedCall(url, 'GET');
}
//call switches the scheduled sessions back to the unscheduled sessions.
//resets all data in db without deleting them.
function switchDbs() {
  return authenticatedCall(endpoints.switchDb);
}

const api = {
  filterSessions,
  filterDates,
  downloadMongoData,
  initialUpload,
  sendAllForScheduling,
  filterRooms,
  getFilterOptionSessions,
  getConferenceTimes,
  storeConferenceTimes,
  getAVOptions,
  getHotels,
  deleteHotels,
  getHotelOptions,
  purgeDb,
  outputSchedule,
  switchDbs,
};

export default api;

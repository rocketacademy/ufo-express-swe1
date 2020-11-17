import { add } from './jsonFileStorage.js';

const FILE_NAME = 'data.json';
const DATA_KEY = 'sightings';

// Non-export Functions

/**
 *
 * @param {*} result - the data received after the read & write function from jsonFileStorage add().
 *                     If data is successfully added, this value is equal to the total number of
 *                     sightings present in the json file.
 * @param {*} error - the error code
 * @param {*} response - represents the HTTP response, used to send response back to client
 *
 * This function sends the response back to client
 */
const sendResponseAfterAddingData = (result, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  const newItemIndex = result - 1;
  response.redirect(`/sighting/:${newItemIndex}`);
};

/**
 * Export Functions
 */
/**
 *
 * @param {*} request  - represents HTTP request
 * @param {*} response - represents the HTTP response that an Express app
 *                       sends when it gets an HTTP request.
 *
 * Function that processes the GET request to display the form for new data entry
 */
export const handleNewDataFormDisplayReq = (request, response) => {
  response.render('newSighting');
};

// Function that processes the POST request for adding new sighting
export const handleAddNewSightingReq = (request, response) => {
  // add an element to the array
  add(FILE_NAME, DATA_KEY, request.body, (data, error) => {
    sendResponseAfterAddingData(data, error, response); });
};

export const handleSingleSightingDisplayReg = (request, response) => {

};

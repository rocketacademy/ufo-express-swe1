import { add, read } from './jsonFileStorage.js';

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
  response.redirect(`/sighting/${newItemIndex}`);
};

/**
 *
 * @param {*} singleSighting - requested data at the specified index, that is to be displayed
 * @param {*} error - error code from file reading
 * @param {*} response - to send HTTP response
 *
 * This function is used to display the result of single sighting request
 */
const sendResponseSingleSighting = (singleSighting, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  console.log(singleSighting);
  response.render('singleSighting', { selectedSight: singleSighting });
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

/**
 *
 * @param {*} request - represents HTTP request
 * @param {*} response - represents HTTP response
 *
 * Function that processes the POST request for adding new sighting
 */
export const handleAddNewSightingReq = (request, response) => {
  // add an element to the array
  // Then call the function to send the response to client
  add(FILE_NAME, DATA_KEY, request.body, (result, error) => {
    sendResponseAfterAddingData(result, error, response); });
};

/**
 *
 * @param {*} request - HTTP request, with index in the body
 * @param {*} response - HTTP response
 *
 * Function that handles the request to display a single sighting at the
 * requested index
 */
export const handleSingleSightingDisplayReg = (request, response) => {
  read(FILE_NAME, (jsonObjectData, error) => {
    const requestedIndex = request.params.index;
    console.log(`index: ${requestedIndex}`);
    sendResponseSingleSighting(jsonObjectData.sightings[requestedIndex], error, response);
  });
};

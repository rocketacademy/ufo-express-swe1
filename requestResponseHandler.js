import { add, read, write } from './jsonFileStorage.js';

const FILE_NAME = 'data.json';
const DATA_KEY = 'sightings';
const sightingsHeaderKeys = ['city', 'state', 'shape', 'duration', 'date_time', 'summary', 'text'];

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
const sendResponseSingleSighting = (requestedIndex, jsonObjectData, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  response.render('singleSighting', { selectedSight: jsonObjectData.sightings[requestedIndex] });
};

const sortSightingsList = (request, listOfSightings) => {
  // Check for query in the request
  console.log('Query received: ', request.query);
  // Get the query Key value
  const sortBy = Object.keys(request.query)[0];
  console.log(sortBy);
  const sortType = request.query[sortBy];
  console.log(sortType);
  // Sorting the filtered sightings array
  listOfSightings.sort((first, second) => {
    if (first[sortBy] < second[sortBy])
    {
      return ((sortType === 'asc') ? -1 : 1);
    }
    if (first[sortBy] > second[sortBy])
    {
      return ((sortType === 'asc') ? 1 : -1);
    }
    return 0;
  });

  return listOfSightings;
};

/**
 *
 * @param {*} listOfSightings
 * @param {*} error - error code from file reading
 * @param {*} response - to send HTTP response
 *
 * This function sends the response to the request to display all the sightings
 * in the data file
 */
const sendResponseListAllSightings = (request, listOfSightings, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  let sortedListOfSightings = listOfSightings;
  if (Object.keys(request.query).length !== 0)
  {
    sortedListOfSightings = sortSightingsList(request, listOfSightings);
  }

  // This variable stores the keys, which will be displayed as header
  response.render('allSightings', {
    sightingsHeader: sightingsHeaderKeys,
    sightingsList: sortedListOfSightings,
  });
};

/**
 *
 * @param {*} requestedIndex - index specified in the request
 * @param {*} jsonObjectData - file data read, in json object format
 * @param {*} error - error code from file reading
 * @param {*} response - to send HTTP response
 *
 * This function renders the html page to display the data requested for editing
 */
const sendResponseDisplayEditForm = (requestedIndex, jsonObjectData, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  response.render('editSighting', {
    requestedItemIndex: requestedIndex,
    sightingsHeader: sightingsHeaderKeys,
    requestedSighting: jsonObjectData.sightings[requestedIndex],
  });
};

/**
 *
 * @param {*} request - HTTP request
 * @param {*} jsonObjectData - file data read, in json object format
 * @param {*} error - error code from file reading
 * @param {*} response - to send HTTP response
 *
 * This function reads the data file and update the requested data at the specified index
 */
const sendResponseAfterEditingData = (request, jsonObjectData, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  const requestedIndex = request.params.index;
  jsonObjectData.sightings[requestedIndex] = request.body;
  write(FILE_NAME, jsonObjectData, (returnData, errorWrite) => {
    if (errorWrite)
    {
      response.status(500).send(`Sorry, Writing to file failed!!. ${errorWrite}`);
      return;
    }
    response.redirect(`/sighting/${requestedIndex}`);
  });
};

const sendResponseAfterDeletingData = (requestedIndex, jsonObjectData, error, response) => {
  if (error)
  {
    response.status(500).send('Sorry, this didnt work!!');
    return;
  }
  jsonObjectData.sightings.splice(requestedIndex, 1);
  write(FILE_NAME, jsonObjectData, (returnData, errorWrite) => {
    if (errorWrite)
    {
      response.status(500).send(`Sorry, Writing to file failed!!. ${errorWrite}`);
      return;
    }
    // response.status(200).send('Deletion successful');
    response.redirect('/');
  });
};

/**
 *
 * @param {*} jsonObjectData - data from file, in json object format
 * @param {*} error - error code returned after reading file
 * @param {*} response - to send HTTP response
 *
 * This function sends the full list of Shapes present in the data, after removing duplicate entries
 */
const sendResponseAfterShapesListDisplay = (jsonObjectData, error, response) => {
  if (error)
  {
    response.status(500).send(`Error occurred: ${error}`);
    return;
  }
  // Create a unique list of shapes.
  // How to: Create a temp object, that stores shape as the key and some value.
  // Here, an empty value is used.
  // If a shape is repeated, it will overwrite the already existing ones and
  // in effect, no shape value is duplicated
  const uniqueShapeListObj = {};
  jsonObjectData.sightings.forEach((element) => {
    if (!element.shape) { return; }
    uniqueShapeListObj[element.shape] = '';
  });
  console.log(uniqueShapeListObj);
  response.render('listAllShapes', { shapesList: uniqueShapeListObj });
};

const sendResponseAfterDisplaySightingsByShape = (requestedShape, jsonObjectData,
  error, response) => {
  if (error)
  {
    response.status(500).send(`Error occurred: ${error}`);
    return;
  }
  const sightingsListByShape = [];
  jsonObjectData.sightings.forEach((singleSighting, index) => {
    if (singleSighting.shape === requestedShape)
    {
      singleSighting.index = index;
      sightingsListByShape.push(singleSighting);
    }
  });
  console.log('Rendering Object: ', {
    requestedShapeName: requestedShape,
    sightingsHeader: sightingsHeaderKeys,
    sightingsList: sightingsListByShape,
  });
  response.render('shapeSightings', {
    requestedShapeName: requestedShape,
    sightingsHeader: sightingsHeaderKeys,
    sightingsList: sightingsListByShape,
  });
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
    sendResponseSingleSighting(request.params.index, jsonObjectData, error, response);
  });
};

/**
 *
 * @param {*} request - HTTP request
 * @param {*} response - HTTP response
 *
 * Function that handles the request to display all the sightings present
 * in the data json file
 */
export const handleAllSightingsDisplayReq = (request, response) => {
  read(FILE_NAME, (jsonObjectData, error) => {
    sendResponseListAllSightings(request, jsonObjectData.sightings, error, response);
  });
};

// Render a form to edit a sighting.
// app.get('/sighting/:index/edit', handleEditDataFormDisplayReq);
export const handleEditDataFormDisplayReq = (request, response) => {
  read(FILE_NAME, (jsonObjectData, error) => {
    sendResponseDisplayEditForm(request.params.index, jsonObjectData, error, response);
  });
};

// Accept a request to edit a single sighting
// app.put('/sighting/:index/edit', handleEditDataPutReq);
export const handleEditDataPutReq = (request, response) => {
  console.log(`Inside handleEditDataPutReq. URL: ${request.url} `);
  // Read the file and update the sighting at the specified index
  read(FILE_NAME, (jsonObjectData, error) => {
    sendResponseAfterEditingData(request, jsonObjectData, error, response);
  });
};

// Accept a request to delete a sighting.
// app.delete('/sighting/:index/delete', handleSightingDeleteReq);
export const handleSightingDeleteReq = (request, response) => {
  // Read the file and delete the sighting at the specified index
  read(FILE_NAME, (jsonObjectData, error) => {
    const requestedIndex = request.params.index;
    sendResponseAfterDeletingData(requestedIndex, jsonObjectData, error, response);
  });
};

// Render a list of sighting shapes
// app.get('/shapes', handleDisplayListOfShapes);
export const handleDisplayListOfShapes = (request, response) => {
  read(FILE_NAME, (jsonObjectData, error) => {
    sendResponseAfterShapesListDisplay(jsonObjectData, error, response);
  });
};

// Render a list of sightings that has one shape
// app.get('/shapes/:shape', handleDisplaySightingsByShape);
export const handleDisplaySightingsByShape = (request, response) => {
  read(FILE_NAME, (jsonObjectData, error) => {
    console.log('Requested params: ', request.params);
    sendResponseAfterDisplaySightingsByShape(request.params.shape, jsonObjectData, error, response);
  });
};

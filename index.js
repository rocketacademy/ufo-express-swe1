import methodOverride from 'method-override';
import express from 'express';
import cookieParser from 'cookie-parser';
import {
  read, add, deleteContent, edit,
} from './jsonFileStorage.js';

// Global set up of relevant apps
const app = express();
const PORT = 3000;
const FILENAME = 'data.json';

// Global tracker of number of visitors;

// Set view engine to EJS
app.set('view engine', 'ejs');
// Middleware to allow static images/css files to be served
app.use(express.static('public'));
// Provides encoding to url queries etc.
app.use(express.urlencoded({ extended: false }));
// Middleware that allows POST methods to be overriden to perform PUT and DELETE requests
app.use(methodOverride('_method'));
// Middleware that allows cookies to be captured;
app.use(cookieParser());

// Function that checks the inputs for validation
const performValidationOnRequestBody = (requestBodyObj, callback) => {
  const inputValidationFeedbackObj = {};
  let isFormValid = true;
  const {
    description, shape,
  } = requestBodyObj;

  if (description.length < 5) {
    inputValidationFeedbackObj.description = 'Description is too short!';
    isFormValid = false;
  } else {
    inputValidationFeedbackObj.description = 'ok';
  }

  if (shape.toLowerCase() !== 'sphere' && shape.toLowerCase() !== 'circle') {
    inputValidationFeedbackObj.shape = 'Shape is not valid.';
    isFormValid = false;
  } else {
    inputValidationFeedbackObj.shape = 'ok';
  }
  callback(inputValidationFeedbackObj, isFormValid);
};

// Function that sets a time for cookies
const setExpiryForCookies = () => {
  let date = new Date(Date.now() + 86400e3);
  date = date.toUTCString();
  return date;
};

// Route: Homepage - Shows all sightings, sortable by ID
app.get('/', (request, response) => {
  const orderOfSort = request.query.sortOrder;
  read(FILENAME, (data, error) => {
    if (error) {
      response.sendStatus(500, error);
      return;
    }

    // Implement cookies that tracks number of visits
    // response.clearCookie('visits');
    let visits = Number(request.cookies.visits);
    // Fn returns true if value is not a number
    if (!Number.isNaN(visits)) {
      visits += 1;
      response.cookie('visits', visits);
      response.cookie('expires', setExpiryForCookies());
    } else {
      visits = 1;
      response.cookie('visits', 1);
      response.cookie('expires', setExpiryForCookies());
    }
    data.visits = visits;

    // Sort by url query params
    data.sightings.sort((a, b) => {
      if (orderOfSort === 'ascending') {
        return a.id - b.id;
      } if (orderOfSort === 'descending') {
        return b.id - a.id;
      }
      return a.id - b.id;
    });
    response.render('allSightings', data);
  });
});

// Route: Create form to input sighting
app.get('/newSighting', (request, response) => {
  read(FILENAME, (data, error) => {
    if (error) {
      response.sendStatus(500, error);
      return;
    }
    response.render('submitNewSightingForm', data);
  });
});

// Create a POST method / request to submit new sighting
app.post('/newSighting', (request, response) => {
  // locally scoped boolean to track if current form is valid
  let isThisFormValid = true;

  // Perform input validation first
  performValidationOnRequestBody(request.body, (feedbackMsg, areFieldsValid) => {
    if (areFieldsValid === false) {
      request.body.feedback = feedbackMsg;
      isThisFormValid = false;
      response.render('submitNewSightingForm', request.body);
    }
  });
  if (isThisFormValid === false) {
    return;
  }

  /**
   * @param {FILENAME} contains all the data of the sightings to be read
   * @param {key} the key to access in the file to be added
   * @param {input} takes in request.body
   * @param {callback} performs a callback after taking in the data and error vars from add fn
  */
  add(FILENAME, 'sightings', request.body, (data, error) => {
    // to be redirected to sighting/<index>
    response.redirect(`/sighting/${data.sightings.length}`);
  });
});

// Route: Render a particular sighting
app.get('/sighting/:id', (request, response) => {
  // id of sighting is not zero-indexed
  const { id } = request.params;
  read(FILENAME, (data) => {
    const sightingData = data.sightings[id - 1];
    response.render('sighting', sightingData);
  });
});

// Render a form to edit a sighting
app.get('/sighting/:id/edit', (request, response) => {
  // id of sighting is not zero-indexed
  const { id } = request.params;
  read(FILENAME, (data) => {
    const sightingData = data.sightings[id - 1];
    response.render('editExistingSightingForm', sightingData);
  });
});

// Edit the sighting through a PUT method
app.put('/sighting/:id/edit', (request, response) => {
  // id of sighting is not zero-indexed
  const { id } = request.params;

  // locally scoped boolean to track if current form is valid
  let isThisFormValid = true;

  // Perform input validation first
  performValidationOnRequestBody(request.body, (feedbackMsg, areFieldsValid) => {
    if (areFieldsValid === false) {
      // Assigning feedback & id from helper function into request.body
      request.body.feedback = feedbackMsg;
      // Note that request.body generated by all the forms does not include id automatically,
      // hence the inclusion
      request.body.id = id;
      isThisFormValid = false;
      response.render('sightingFormEdit', request.body);
    }
  });
  if (isThisFormValid === false) {
    return;
  }
  /**
 * @param {FILENAME} some file to be read
 * @param {id} the corresponding id of the sighting
 * @param {input} takes in request.body
 * @param {callback} performs a callback after taking in the data and error vars from add fn
*/
  edit(FILENAME, id, request.body, (data, error) => {
    if (error) {
      response.sendStatus(500, 'error');
      return;
    }
    response.redirect(`/sighting/${data.sightings.length}`);
  });
});

// Render a list of all sighting shapes
app.get('/shapes', (request, response) => {
  read(FILENAME, (data) => {
    response.render('allShapes', data);
  });
});

// Render sighting based on a shape
app.get('/shapes/:shape', (request, response) => {
  const { shape: selectedShape } = request.params;
  read(FILENAME, (data) => {
    // Declare an object that stores the desired shape, followed by corresponding sighting
    const selectedShapeSightings = { sightings: [], shape: '' };
    selectedShapeSightings.shape = selectedShape;
    // Filter by shape and stores all the associated sighting(s)
    // into an sightings key/variable within selectedShapeSightings obj
    selectedShapeSightings.sightings = data.sightings.filter((sighting) => sighting.shape === selectedShape);
    response.render('shape', selectedShapeSightings);
  });
});

// Accept a request to delete a sighting
app.delete('/sighting/:id/', (request, response) => {
  const { id } = request.params;
  deleteContent(FILENAME, id, (data, error) => {
    if (error) {
      response.sendStatus(500, 'error');
      return;
    }
    response.redirect('/');
  });
});

app.listen(PORT);

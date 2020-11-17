import methodOverride from 'method-override';
import express from 'express';
import {
  read, add, deleteContent, edit,
} from './jsonFileStorage.js';

const app = express();
const PORT = 3000;
const FILENAME = 'data.json';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Helper Function that converts request.body to an Iterable Obj
const convertToIterableObj = (nonIterableObj) => {
  const newObj = {};
  // Convert request.body into an iterable object
  Object.entries(nonIterableObj).forEach(([key, value]) => {
    newObj[key] = value;
  });
  return newObj;
};

// Helper Function that checks the inputs for validation
const performValidationOnRequestBody = (requestBodyObj, callback) => {
  const inputValidationFeedbackObj = {};
  let isFormValid = true;
  const {
    _, description, date_time, city, state, shape, duration, summary, __,
  } = requestBodyObj;

  if (description.length < 10) {
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

// Homepage - Shows all sightings, sortable by ID
app.get('/', (request, response) => {
  const orderOfSort = request.query.sortOrder;
  read(FILENAME, (data, error) => {
    if (error) {
      response.sendStatus(500, error);
      return;
    }
    data.sightings.sort((a, b) => {
      if (orderOfSort === 'ascending') {
        return a.id - b.id;
      } if (orderOfSort === 'descending') {
        return b.id - a.id;
      }
      return a.id - b.id;
    });
    response.render('sightings', data);
  });
});

// Create form to input sighting
app.get('/newSighting', (request, response) => {
  read(FILENAME, (data, error) => {
    if (error) {
      response.sendStatus(500, error);
      return;
    }
    response.render('submitNewSightingForm', data);
  });
});

// Create a POST method / submit new sighting
// Params - filename, key, input, callback)
app.post('/newSighting', (request, response) => {
  const requestBodyObj = convertToIterableObj(request.body);
  // Perform input validation first

  performValidationOnRequestBody(requestBodyObj, (feedbackMsg, isFormValid) => {
    if (isFormValid === false) {
      request.body.feedback = feedbackMsg;
      console.log(request.body);
      response.render('submitNewSightingForm', request.body);
    }
  });

  add(FILENAME, 'sightings', requestBodyObj, (data, error) => {
    // to be redirected to sighting/<index>
    response.redirect(`/sighting/${data.sightings.length}`);
  });
});

// Render a particular sighting
app.get('/sighting/:id', (request, response) => {
  const { id } = request.params;
  read(FILENAME, (data) => {
    const sightingData = data.sightings[id - 1];
    response.render('sighting', sightingData);
  });
});

// Render a form to edit a sighting
app.get('/sighting/:id/edit', (request, response) => {
  const { id } = request.params;
  read(FILENAME, (data) => {
    const sightingData = data.sightings[id - 1];
    response.render('sightingFormEdit', sightingData);
  });
});

// Edit the sighting
app.put('/sighting/:id/edit', (request, response) => {
  const { id } = request.params;
  const requestBodyObj = convertToIterableObj(request.body);
  edit(FILENAME, id, requestBodyObj, (data, error) => {
    if (error) {
      response.sendStatus(500, 'error');
      return;
    }
    response.redirect('/');
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
    const selectedShapeSightings = { sighting: '', shape: '' };
    selectedShapeSightings.shape = selectedShape;
    selectedShapeSightings.sightings = data.sightings.filter((sighting) => sighting.shape === selectedShape);
    console.log(selectedShapeSightings, 'shape sighting');
    response.render('shape', selectedShapeSightings);
  });
});

// Accept a request to delete a sighting
app.delete('/sighting/:id/', (request, response) => {
  const { id } = request.params;
  deleteContent(FILENAME, id, () => {
    console.log('deleting sighting now');
    response.redirect('/');
  });
});

app.listen(PORT);

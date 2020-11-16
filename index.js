import methodOverride from 'method-override';
import express from 'express';
import {
  read, add, deleteContent, write,
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

// Homepage - Shows all sightings
app.get('/', (request, response) => {
  read(FILENAME, (data) => {
    response.render('sightings', data);
  });
});

// Create form to input sighting
app.get('/newSighting', (request, response) => {
  read(FILENAME, (data) => {
    response.render('submitNewSightingForm', data);
  });
});

// Create a POST method / submit new sighting
// Param - filename, key, input, callback)
app.post('/newSighting', (request, response) => {
  const requestBodyObj = convertToIterableObj(request.body);
  // Read file to append a number tag to each sighting
  read(FILENAME, (data) => {
    const newSighting = { number: Number(data.sightings.length) + 1, ...requestBodyObj };
    console.log(newSighting, 'posting');
    add(FILENAME, 'sightings', newSighting, (data) => {
    // to be redirected to sighting/<index>
      response.redirect(`/sighting/${data.sightings.length}`);
    });
  });
});

// Render a particular sighting
app.get('/sighting/:index', (request, response) => {
  const { index: number } = request.params;
  console.log(number, 'number');
  read(FILENAME, (data) => {
    const sightingData = data.sightings[number - 1];
    response.render('sighting', sightingData);
  });
});

// Render a form to edit a sighting
app.get('/sighting/:index/edit', (request, response) => {
  const { index: number } = request.params;
  read(FILENAME, (data) => {
    const sightingData = data.sightings[number - 1];
    response.render('sightingFormEdit', sightingData);
  });
});

// Edit the sighting
app.put('/sighting/:index/edit', (request, response) => {
  const { index: indexNum } = request.params;
  const requestBodyObj = convertToIterableObj(request.body);
  read(FILENAME, (data) => {
    const editedSightingObj = { number: indexNum, ...requestBodyObj };
    data.sightings[indexNum - 1] = editedSightingObj;

    write(FILENAME, data);
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
app.delete('/sighting/:index/', (request, response) => {
  const { index } = request.params;
  deleteContent(FILENAME, index, () => {
    console.log('deleting sighting now');
    response.redirect('/');
  });
});

app.listen(PORT);

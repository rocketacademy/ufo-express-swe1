import express from 'express';
import {
  handleNewDataFormDisplayReq, handleAddNewSightingReq, handleSingleSightingDisplayReg,
  handleAllSightingsDisplayReq,
} from './requestResponseHandler.js';

const PORT = 3004;

const app = express();
// Set the view engine to generate HTML responses through ejs files in view directory
app.set('view engine', 'ejs');
// To receive POST request data as an object
// This middleware function parses incoming requests with urlenconded payloads
app.use(express.urlencoded({ extended: false }));
// To serve the static files like css files, image files.
// This will load the files that are in the public directory
app.use(express.static('public'));

// Render a form that will create a new sighting
app.get('/sighting', handleNewDataFormDisplayReq);
// Accept a post request to create a new sighting
app.post('/sighting', handleAddNewSightingReq);
// Render a single sighting.
app.get('/sighting/:index', handleSingleSightingDisplayReg);
// Render a list of Sightings
app.get('/', handleAllSightingsDisplayReq);
// listening in the port
app.listen(PORT);

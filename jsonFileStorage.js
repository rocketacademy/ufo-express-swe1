import { readFile, writeFile } from 'fs';
// read a file. call the callback with the file contents
export function read(filename, callback) {
  const whenFileIsRead = (error, jsonContent) => {
    // check for reading errors
    if (error) {
      console.log('reading error', error);
      return;
    }

    // start dealing with the JSON

    // parse the string into a *real* JavaScript object
    const content = JSON.parse(jsonContent);

    // call the function that got passed in
    callback(content, null);
  };

  // read the file
  readFile(filename, 'utf-8', whenFileIsRead);
}

// write a file with the object passed in
export function write(filename, content, callback) {
  const outputContent = JSON.stringify(content);

  writeFile(filename, outputContent, (writingError) => {
    if (writingError) {
      console.log('error writing', writingError);
    } else {
      // file written successfully
      console.log('success!');
      if (callback) {
        callback();
      }
    }
  });
}

// Add an element to an array

export function add(filename, key, input, callback) {
  // set the file read callback
  const whenFileIsRead = (readingError, jsonContent) => {
    // check for reading errors
    if (readingError) {
      console.log('reading error', readingError);
      callback(null, readingError);
      return;
    }

    // parse the string into a JavaScript object
    const content = JSON.parse(jsonContent);

    // check for the key, if it doesn't exist, exit out
    if (!(key in content)) {
      // create your own error message
      const errorMessage = "key doesn't exist";

      // call the callback
      callback(null, errorMessage);
      return;
    }

    content[key].push(input);

    // turn it into a string
    const outputContent = JSON.stringify(content);

    writeFile(filename, outputContent, (writingError) => {
      if (writingError) {
        console.log('error writing', outputContent, writingError);
        callback(null, writingError);
        return;
      }
      // file written successfully
      console.log('success!');
      callback(content, null);
    });
  };

  // read the file
  readFile(filename, 'utf-8', whenFileIsRead);
}

export function edit(filename, index, newInput, callback) {
  const editItem = (data, error) => {
    if (error) {
      callback(error);
    }
    console.log(index, 'index');
    data.sightings[index - 1] = newInput;
    console.log(data.sightings[index - 1], 'new Data');
    console.log(data, 'data');
    callback(data);
    write(filename, data);
  };

  read(filename, editItem);
}

export function deleteContent(filename, index, callback) {
  const deleteItem = (data) => {
    data.sightings.splice(index - 1, 1);
    if (callback) {
      callback(data);
    }
    data.sightings.forEach((sighting, arrayIndex) => {
      sighting.number = arrayIndex + 1;
    });
    write(filename, data);
  };
  read(filename, deleteItem);
}

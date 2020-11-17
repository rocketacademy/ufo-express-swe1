let isSubmitBtnEnabled = false;

// Function that iterates through every input element
// to check if it is valid
const checkForm = () => {
  const userInputList = document.querySelectorAll('input');

  userInputList.forEach((input) => {
    if (input.checkValidity() === false) {
      isSubmitBtnEnabled = false;
    } else {
      isSubmitBtnEnabled = true;
    }
  });
};

document.addEventListener('keyup', (event) => {
  console.log(event, 'keyup');
  const submitBtn = document.getElementById('submitNewSighting');
  // check form everytime there is a key up from the keyboard
  checkForm();
  if (isSubmitBtnEnabled === false) {
    submitBtn.setAttribute('disabled');
  } else {
    // hence enable submit btn
    submitBtn.removeAttribute('disabled');
  }
});

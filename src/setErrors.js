/* eslint "no-use-before-define": 0 */

import {isFieldValue, makeFieldValue} from './fieldValue';
const isMetaKey = key => key[0] === '_';

function setError(state, error, destKey) {
  if (error) {
    const copy = {
      ...state,
      [destKey]: error
    };
    return makeFieldValue(copy);
  }
  return state;
}

function clearError(state, destKey) {
  if (state && state[destKey]) {
    const copy = {...state};
    delete copy[destKey];
    return makeFieldValue(copy);
  }
  return state;
}

function setErrorsStateIsArray(state, errors, destKey) {
  const copy = state.map((stateItem, index) => {
    return setErrors(stateItem, errors && errors[index], destKey);
  });

  if (Array.isArray(errors)) {
    errors.forEach((errorItem, index) => copy[index] = setErrors(copy[index], errorItem, destKey));
  }
  return copy;
}

function setErrorsErrorsIsArray(state, errors, destKey) {
  if (typeof state === 'object' && Object.keys(state).length > 0) {
    return setErrors(state, errors[0], destKey);
  }
  return errors.map((errorItem) => {
    return setErrors({}, errorItem, destKey);
  });
}

function setErrorsObject(state, errors, destKey) {
  const errorKeys = errors && typeof errors === 'object' ? Object.keys(errors) : [];
  const stateKeys = state && typeof state === 'object' ? Object.keys(state) : [];
  const reducerKeys = stateKeys.length > 0 ? stateKeys : errorKeys;
  const initialState = state || {};

  const newState = reducerKeys.length > 0 ? reducerKeys.reduce((accumulator, key) =>
        isMetaKey(key) ? accumulator : {
          ...accumulator,
          [key]: setErrors(initialState[key], errors && errors[key], destKey)
        },
      initialState) : state;

  return newState;
}

 /**
  * Sets an error on a field deep in the tree, returning a new copy of the state
  */
const setErrors = (state, errors, destKey) => {

  if (typeof errors === 'object' && Object.keys(errors).length === 0 && !state) {
    return state;
  }

  let newState;
  let error;

  if (Array.isArray(state)) {
    newState = setErrorsStateIsArray(state, errors, destKey);
  } else if (Array.isArray(errors)) {
    newState = setErrorsErrorsIsArray(state, errors, destKey);
  } else if (isFieldValue(state)) {
    newState = state;
    error = errors;
  } else {
    newState = setErrorsObject(state, errors, destKey);
    error = typeof errors === 'string' ? errors : null;
  }

  if (errors) {
    return setError(newState, error, destKey);
  }
  return clearError(newState, destKey);
};

export default setErrors;

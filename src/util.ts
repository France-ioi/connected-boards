export function arrayContains(array, needle) {
  for (let index in array) {
    if (needle == array[index]) {
      return true;
    }
  }
  return false;
}

/**
 * This method allow us to verify if the current value is primitive. A primitive is a string or a number or boolean
 * (any value that can be safely compared
 * @param obj The object to check if it is a primitive or not
 * @return {boolean} true if object is primitive, false otherwise
 */
export function isPrimitive(obj)
{
  return (obj !== Object(obj));
}

/**
 * THis function allow us to compare two objects. Do not call with {@code null} or {@code undefined}
 * Be careful! Do not use this with circular objects.
 * @param obj1 The first object to compare
 * @param obj2 The second object to compare
 * @return {boolean} true if objects are equals, false otherwise.
 */
export function deepEqual(obj1, obj2) {

  if (obj1 === obj2) // it's just the same object. No need to compare.
    return true;

  // if one is primitive and not the other, then we can return false. If both are primitive, then the up
  // comparison can return true
  if (isPrimitive(obj1) || isPrimitive(obj2))
    return false;

  if (Object.keys(obj1).length !== Object.keys(obj2).length)
    return false;

  // compare objects with same number of keys
  for (let key in obj1)
  {
    if (!(key in obj2)) return false; //other object doesn't have this prop
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export function getImg(filename) {
  // Get the path to an image stored in bebras-modules
  return (window.modulesPath ? window.modulesPath : '../../modules/') + 'img/quickpi/' + filename;
}

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function deepMerge(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

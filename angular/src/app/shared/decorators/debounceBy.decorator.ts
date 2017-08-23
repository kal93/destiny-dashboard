/**
 * Calls the function once, and cancels the call if it's already been called before the time is up
 * @param {number} milliseconds
 */
export function debounceBy(milliseconds: number) {
  let lastExecuteTime: number = 0;

  return function (target, key, descriptor) {
    let originalMethod = descriptor.value;

    descriptor.value = function (...args) {

      // If this has not been called within the debounce time, call original function
      let lastTimeDifference = (lastExecuteTime + milliseconds) - Date.now();
      if (lastTimeDifference < 0) {
        lastExecuteTime = Date.now();
        originalMethod.apply(this, args);
      }

    };
    return descriptor;
  }
}
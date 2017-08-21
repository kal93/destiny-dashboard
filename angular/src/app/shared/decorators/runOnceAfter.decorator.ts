/**
 * Waits until the specified time has passed before running. The timer is reset after each time the function is called.
 * @param {number} milliseconds
 */
export function runOnceAfter(milliseconds: number) {
  let lastExecutionTimeoutId: NodeJS.Timer;
  return function (target, key, descriptor) {

    let originalMethod = descriptor.value;

    clearTimeout(lastExecutionTimeoutId);
    descriptor.value = function (...args) {
      lastExecutionTimeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, milliseconds);

    };
    return descriptor;
  }
}
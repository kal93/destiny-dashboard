/**
 * Delays a function call by provided ms
 * @param {number} milliseconds
 */
export function delayBy(milliseconds: number) {
  return function (target, key, descriptor) {

    let originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      setTimeout(() => {
        originalMethod.apply(this, args);
      }, milliseconds);

    };
    return descriptor;
  }
}
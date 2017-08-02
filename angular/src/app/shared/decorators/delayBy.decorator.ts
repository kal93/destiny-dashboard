export function delayBy(milliseconds: number) {
  return function (target, key, descriptor) {

    var originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      setTimeout(() => {
        originalMethod.apply(this, args);
      }, milliseconds);

    };
    return descriptor;
  }
}
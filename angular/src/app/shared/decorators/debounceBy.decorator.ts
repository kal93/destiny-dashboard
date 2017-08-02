export function debounceBy(milliseconds: number) {
  var lastExecuteTime: number = 0;
  var lastExecutionTimeoutId: NodeJS.Timer;

  return function (target, key, descriptor) {
    var originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      clearTimeout(lastExecutionTimeoutId);

      // If this has not been called within the debounce time, call original function
      var lastTimeDifference = (lastExecuteTime + milliseconds) - Date.now();
      if (lastTimeDifference < 0) {
        lastExecuteTime = Date.now();
        originalMethod.apply(this, args);
      }

      // If this has been called within the debounce time, schedule it to run later
      else {
        lastExecutionTimeoutId = setTimeout(() => {
          originalMethod.apply(this, args);
        }, lastTimeDifference);
      }

    };
    return descriptor;
  }
}
export function debounce<T>(func: Function, wait: number) {
  var timeout: number, result: T;

  var debounced = function <T>(this: T) {
    var context = this;
    var args = arguments;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      result = func.apply(context, args);
    }, wait);
    return result;
  };

  return debounced;
}

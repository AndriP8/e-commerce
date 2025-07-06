export const debounce = (fn: (arg0: string) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: [string]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

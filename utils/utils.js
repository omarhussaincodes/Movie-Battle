const debounce = (func, delay = 500) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearInterval(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}
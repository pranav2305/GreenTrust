import { useState, useEffect } from 'react';

export function useLocalStorage(key, fallbackValue) {
    const [value, setValue] = useState(fallbackValue);
    useEffect(() => {
        const stored = localStorage.getItem(key);
        setValue(stored ? stored : fallbackValue);
    }, [fallbackValue, key]);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}
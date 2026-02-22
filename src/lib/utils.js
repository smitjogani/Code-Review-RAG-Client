import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes conditionally and without conflict.
 * @param {...(string|undefined|null|false)} inputs - Class names to merge.
 * @returns {string} - Merged class string.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

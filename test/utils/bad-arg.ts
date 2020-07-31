const noArg = Symbol("invalid arg");

/**
 * Gives back a bad argument for testing.
 *
 * @param arg - An argument override to unsafely type cast to T.
 * @returns A bad argument. Do not trust it!
 */
export function badArg<T>(arg: unknown = noArg): T {
    return arg as T;
}

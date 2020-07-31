/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export type ToUnion<T extends readonly unknown[]> = T[number];

// Variadic types will simplify this greatly
export function permutations(): [];
export function permutations<A extends readonly unknown[]>(
    a: A,
): [ToUnion<A>][];
export function permutations<
    A extends readonly unknown[],
    B extends readonly unknown[]
>(a: A, b: B): [ToUnion<A>, ToUnion<B>][];
export function permutations<
    A extends readonly unknown[],
    B extends readonly unknown[],
    C extends readonly unknown[]
>(a: A, b: B, c: C): [ToUnion<A>, ToUnion<B>, ToUnion<C>][];
export function permutations<
    A extends readonly unknown[],
    B extends readonly unknown[],
    C extends readonly unknown[],
    D extends readonly unknown[]
>(a: A, b: B, c: C, d: D): [ToUnion<A>, ToUnion<B>, ToUnion<C>, ToUnion<D>][];
export function permutations<
    A extends readonly unknown[],
    B extends readonly unknown[],
    C extends readonly unknown[],
    D extends readonly unknown[],
    E extends readonly unknown[]
>(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
): [ToUnion<A>, ToUnion<B>, ToUnion<C>, ToUnion<D>, ToUnion<E>][];

/**
 * Builds permutations of arrays, with generic type building.
 *
 * @param args - Arrays to build permutations from.
 * @returns An array of arrays, each sub array containing one of the possible
 * permutations from the passed in array values.
 */
export function permutations(...args: unknown[][]): unknown[][] {
    if (args.length === 0) {
        return [];
    }
    if (args.length === 1) {
        return args[0].map((a) => [a]);
    }

    const result = [] as unknown[][];
    const [items, ...rest] = args;
    const sub: unknown[][] = (permutations as any)(...rest);
    for (const item of items) {
        for (const s of sub) {
            result.push([item, ...s]);
        }
    }

    return result;
}

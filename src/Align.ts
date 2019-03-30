/**
 * @file The `Align` type class extends the `Semialign` type class with a value `nil`, which
 * acts as a unit in regards to `align`.
 *
 * `Align` instances must satisfy the following laws in addition to the `Semialign` laws:
 *
 * 1. Right identity: `F.align(fa, nil) = F.map(fa, this_)`
 * 2. Left identity: `F.align(nil, fa) = F.map(fa, that)`
 *
 * Adapted from http://hackage.haskell.org/package/these-0.8/docs/Data-Align.html
 */
import { HKT, Type, Type2, Type3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT'
import { Semigroup } from 'fp-ts/lib/Semigroup'
import { identity, tuple } from 'fp-ts/lib/function'
import { Option, some, none } from 'fp-ts/lib/Option'
import { catOptions } from 'fp-ts/lib/Array'
import {
  Semialign,
  Semialign1,
  Semialign2,
  Semialign2C,
  Semialign3,
  Semialign3C,
  option as O,
  array as A,
  record as R
} from './Semialign'

/**
 * @since 0.0.3
 */
export interface Align<F> extends Semialign<F> {
  readonly nil: <A>() => HKT<F, A>
}

export interface Align1<F extends URIS> extends Semialign1<F> {
  readonly nil: <A>() => Type<F, A>
}

export interface Align2<F extends URIS2> extends Semialign2<F> {
  readonly nil: <L, A>() => Type2<F, L, A>
}

export interface Align3<F extends URIS3> extends Semialign3<F> {
  readonly nil: <U, L, A>() => Type3<F, U, L, A>
}

export interface Align2C<F extends URIS2, L> extends Semialign2C<F, L> {
  readonly nil: <A>() => Type2<F, L, A>
}

export interface Align3C<F extends URIS3, U, L> extends Semialign3C<F, U, L> {
  readonly nil: <A>() => Type3<F, U, L, A>
}

/**
 * Align two structures, using a semigroup for combining values.
 *
 * @example
 * import { semigroupSum } from 'fp-ts/lib/Semigroup'
 * import { salign, array } from 'fp-ts-contrib/lib/Align'
 *
 * assert.deepStrictEqual(salign(array, semigroupSum)([1, 2, 3], [4, 5]), [5, 7, 3])
 *
 * @since 0.0.3
 */
export function salign<F extends URIS3, A, L>(
  F: Align3<F>,
  S: Semigroup<A>
): <U, L>(fx: Type3<F, U, L, A>, fy: Type3<F, U, L, A>) => Type3<F, U, L, A>
export function salign<F extends URIS3, A, U, L>(
  F: Align3C<F, U, L>,
  S: Semigroup<A>
): (fx: Type3<F, U, L, A>, fy: Type3<F, U, L, A>) => Type3<F, U, L, A>
export function salign<F extends URIS2, A>(
  F: Align2<F>,
  S: Semigroup<A>
): <L>(fx: Type2<F, L, A>, fy: Type2<F, L, A>) => Type2<F, L, A>
export function salign<F extends URIS2, A, L>(
  F: Align2C<F, L>,
  S: Semigroup<A>
): (fx: Type2<F, L, A>, fy: Type2<F, L, A>) => Type2<F, L, A>
export function salign<F extends URIS, A>(F: Align1<F>, S: Semigroup<A>): (fx: Type<F, A>, fy: Type<F, A>) => Type<F, A>
export function salign<F, A>(F: Align<F>, S: Semigroup<A>): (fx: HKT<F, A>, fy: HKT<F, A>) => HKT<F, A>
export function salign<F, A>(F: Align<F>, S: Semigroup<A>): (fx: HKT<F, A>, fy: HKT<F, A>) => HKT<F, A> {
  return (fx, fy) => F.alignWith(fx, fy, xy => xy.fold(identity, identity, S.concat))
}

/**
 * Align two structures, using `none` to fill blanks.
 *
 * It is similar to `zip`, but it doesn't discard elements.
 *
 * @example
 * import { some, none } from 'fp-ts/lib/Option'
 * import { padZip, array } from 'fp-ts-contrib/lib/Align'
 *
 * assert.deepStrictEqual(padZip(array)([1, 2, 3], [4, 5]), [[some(1), some(4)], [some(2), some(5)], [some(3), none]])
 *
 * @since 0.0.3
 */
export function padZip<F extends URIS3, L>(
  F: Align3<F>
): <U, L, A, B>(fa: Type3<F, U, L, A>, fb: Type3<F, U, L, B>) => Type3<F, U, L, [Option<A>, Option<B>]>
export function padZip<F extends URIS3, U, L>(
  F: Align3C<F, U, L>
): <A, B>(fa: Type3<F, U, L, A>, fb: Type3<F, U, L, B>) => Type3<F, U, L, [Option<A>, Option<B>]>
export function padZip<F extends URIS2>(
  F: Align2<F>
): <L, A, B>(fa: Type2<F, L, A>, fb: Type2<F, L, B>) => Type2<F, L, [Option<A>, Option<B>]>
export function padZip<F extends URIS2, L>(
  F: Align2C<F, L>
): <A, B>(fa: Type2<F, L, A>, fb: Type2<F, L, B>) => Type2<F, L, [Option<A>, Option<B>]>
export function padZip<F extends URIS>(
  F: Align1<F>
): <A, B>(fa: Type<F, A>, fb: Type<F, B>) => Type<F, [Option<A>, Option<B>]>
export function padZip<F>(F: Align<F>): <A, B>(fa: HKT<F, A>, fb: HKT<F, B>) => HKT<F, [Option<A>, Option<B>]>
export function padZip<F>(F: Align<F>): <A, B>(fa: HKT<F, A>, fb: HKT<F, B>) => HKT<F, [Option<A>, Option<B>]> {
  return (fa, fb) => padZipWith(F)(fa, fb, (a, b) => tuple(a, b))
}

/**
 * Align two structures by applying a function to each pair of aligned elements, using `none` to fill blanks.
 *
 * It is similar to `zipWith`, but it doesn't discard elements.
 *
 * @example
 * import { Option } from 'fp-ts/lib/Option'
 * import { padZipWith, array } from 'fp-ts-contrib/lib/Align'
 *
 * const f = (ma: Option<number>, mb: Option<string>) => ma.fold('*', a => a.toString()) + mb.getOrElse('#')
 * assert.deepStrictEqual(padZipWith(array)([1, 2], ['a'], f), ['1a', '2#'])
 * assert.deepStrictEqual(padZipWith(array)([1], ['a', 'b'], f), ['1a', '*b'])
 *
 * @since 0.0.3
 */
export function padZipWith<F extends URIS3, L>(
  F: Align3<F>
): <U, L, A, B, C>(
  fa: Type3<F, U, L, A>,
  fb: Type3<F, U, L, B>,
  f: (a: Option<A>, b: Option<B>) => C
) => Type3<F, U, L, C>
export function padZipWith<F extends URIS3, U, L>(
  F: Align3C<F, U, L>
): <A, B, C>(fa: Type3<F, U, L, A>, fb: Type3<F, U, L, B>, f: (a: Option<A>, b: Option<B>) => C) => Type3<F, U, L, C>
export function padZipWith<F extends URIS2>(
  F: Align2<F>
): <L, A, B, C>(fa: Type2<F, L, A>, fb: Type2<F, L, B>, f: (a: Option<A>, b: Option<B>) => C) => Type2<F, L, C>
export function padZipWith<F extends URIS2, L>(
  F: Align2C<F, L>
): <A, B, C>(fa: Type2<F, L, A>, fb: Type2<F, L, B>, f: (a: Option<A>, b: Option<B>) => C) => Type2<F, L, C>
export function padZipWith<F extends URIS>(
  F: Align1<F>
): <A, B, C>(fa: Type<F, A>, fb: Type<F, B>, f: (a: Option<A>, b: Option<B>) => C) => Type<F, C>
export function padZipWith<F>(
  F: Align<F>
): <A, B, C>(fa: HKT<F, A>, fb: HKT<F, B>, f: (a: Option<A>, b: Option<B>) => C) => HKT<F, C>
export function padZipWith<F>(
  F: Align<F>
): <A, B, C>(fa: HKT<F, A>, fb: HKT<F, B>, f: (a: Option<A>, b: Option<B>) => C) => HKT<F, C> {
  return (fa, fb, f) =>
    F.alignWith(fa, fb, ab => ab.bimap(some, some).fold(a => f(a, none), b => f(none, b), (a, b) => f(a, b)))
}

/**
 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If the
 * left input array is short, it will be padded using `none`.
 *
 * It is similar to `zipWith`, but it doesn't discard elements when the left input array is shorter than the right.
 *
 * @example
 * import { Option } from 'fp-ts/lib/Option'
 * import { lpadZipWith } from 'fp-ts-contrib/lib/Align'
 *
 * const f = (ma: Option<number>, b: string) => ma.fold('*', a => a.toString()) + b
 * assert.deepStrictEqual(lpadZipWith([1, 2, 3], ['a', 'b', 'c', 'd'], f), ['1a', '2b', '3c', '*d'])
 * assert.deepStrictEqual(lpadZipWith([1, 2, 3, 4], ['a', 'b', 'c'], f), ['1a', '2b', '3c'])
 *
 * @since 0.0.3
 */
export function lpadZipWith<A, B, C>(xs: Array<A>, ys: Array<B>, f: (a: Option<A>, b: B) => C): Array<C> {
  return catOptions(padZipWith(array)(xs, ys, (ma, mb) => mb.map(b => f(ma, b))))
}

/**
 * Takes two arrays and returns an array of corresponding pairs. If the left input array is short, it will be
 * padded using `none`.
 *
 * It is similar to `zip`, but it doesn't discard elements when the left input array is shorter than the right.
 *
 * @example
 * import { some, none } from 'fp-ts/lib/Option'
 * import { lpadZip } from 'fp-ts-contrib/lib/Align'
 *
 * assert.deepStrictEqual(lpadZip([1, 2], ['a', 'b', 'c']), [[some(1), 'a'], [some(2), 'b'], [none, 'c']])
 * assert.deepStrictEqual(lpadZip([1, 2, 3], ['a', 'b']), [[some(1), 'a'], [some(2), 'b']])
 *
 * @since 0.0.3
 */
export function lpadZip<A, B>(xs: Array<A>, ys: Array<B>): Array<[Option<A>, B]> {
  return lpadZipWith(xs, ys, (a, b) => tuple(a, b))
}

/**
 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If the
 * right input array is short, it will be padded using `none`.
 *
 * It is similar to `zipWith`, but it doesn't discard elements when the right input array is shorter than the left.
 *
 * @example
 * import { Option } from 'fp-ts/lib/Option'
 * import { rpadZipWith } from 'fp-ts-contrib/lib/Align'
 *
 * const f = (a: number, mb: Option<string>) => a.toString() + mb.getOrElse('*')
 * assert.deepStrictEqual(rpadZipWith([1, 2, 3, 4], ['a', 'b', 'c'], f), ['1a', '2b', '3c', '4*'])
 * assert.deepStrictEqual(rpadZipWith([1, 2, 3], ['a', 'b', 'c', 'd'], f), ['1a', '2b', '3c'])
 *
 * @since 0.0.3
 */
export function rpadZipWith<A, B, C>(xs: Array<A>, ys: Array<B>, f: (a: A, b: Option<B>) => C): Array<C> {
  return lpadZipWith(ys, xs, (a, b) => f(b, a))
}

/**
 * Takes two arrays and returns an array of corresponding pairs. If the right input array is short, it will be
 * padded using `none`.
 *
 * It is similar to `zip`, but it doesn't discard elements when the right input array is shorter than the left.
 *
 * @example
 * import { some, none } from 'fp-ts/lib/Option'
 * import { rpadZip } from 'fp-ts-contrib/lib/Align'
 *
 * assert.deepStrictEqual(rpadZip([1, 2, 3], ['a', 'b']), [[1, some('a')], [2, some('b')], [3, none]])
 * assert.deepStrictEqual(rpadZip([1, 2], ['a', 'b', 'c']), [[1, some('a')], [2, some('b')]])
 *
 * @since 0.0.3
 */
export function rpadZip<A, B>(xs: Array<A>, ys: Array<B>): Array<[A, Option<B>]> {
  return rpadZipWith(xs, ys, (a, b) => tuple(a, b))
}

/**
 * `Option` instance extended with `Align`
 *
 * @since 0.0.3
 */
export const option: typeof O & Align1<typeof O.URI> = {
  ...O,
  /**
   * Unit value in regards to `align`
   */
  nil: <A>(): Option<A> => none
}

/**
 * `Array` instance extended with `Align`
 *
 * @since 0.0.3
 */
export const array: typeof A & Align1<typeof A.URI> = {
  ...A,
  /**
   * Unit value in regards to `align`
   */
  nil: <A>(): Array<A> => []
}

/**
 * `Record` instance extended with `Align`
 *
 * @since 0.0.3
 */
export const record = {
  ...R,
  /**
   * Unit value in regards to `align`
   */
  nil: <A>(): Record<string, A> => ({})
}

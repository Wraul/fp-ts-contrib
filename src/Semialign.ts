/**
 * @file The `Semialign` type class represents functors supporting a zip operation that takes the
 * union of non-uniform shapes.
 *
 * `Semialign` instances are required to satisfy the following laws:
 *
 * 1. `F.align(fa, fa) = F.map(fa, (a) => both(a, a))`
 * 2. `F.align(F.map(fa, f), F.map(fb, g)) = F.map(F.align(fa, fb), (t) => These.bimap(t, f, g))`
 * 3. `F.alignWith(fa, fb, f) = F.map(F.align(fa, fb), f)`
 * 4. `F.align(fa, F.align(fb, fc)) = F.map(F.align(F.align(fa, fb), fc), These.assoc)`
 *
 * Where `These.assoc` implements the associativity law of `These` and has the following type signature:
 * `function assoc<A, B, C>(fa: These<A, These<B, C>>): These<These<A, B>, C>`
 *
 * Adapted from http://hackage.haskell.org/package/these-0.8/docs/Data-Align.html
 */
import { Functor, Functor1, Functor2, Functor2C, Functor3, Functor3C } from 'fp-ts/lib/Functor'
import { HKT, Type, Type2, Type3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT'
import { These, this_, that, both } from 'fp-ts/lib/These'
import { Option, some, none, option as O } from 'fp-ts/lib/Option'
import { array as A } from 'fp-ts/lib/Array'
import { NonEmptyArray, nonEmptyArray as NA } from 'fp-ts/lib/NonEmptyArray'
import * as R from 'fp-ts/lib/Record'
import { identity } from 'fp-ts/lib/function'

/**
 * @since 0.3.0
 */
export interface Semialign<F> extends Functor<F> {
  readonly align: <A, B>(fa: HKT<F, A>, fb: HKT<F, B>) => HKT<F, These<A, B>>
  readonly alignWith: <A, B, C>(fa: HKT<F, A>, fb: HKT<F, B>, f: (x: These<A, B>) => C) => HKT<F, C>
}

export interface Semialign1<F extends URIS> extends Functor1<F> {
  readonly align: <A, B>(fa: Type<F, A>, fb: Type<F, B>) => Type<F, These<A, B>>
  readonly alignWith: <A, B, C>(fa: Type<F, A>, fb: Type<F, B>, f: (x: These<A, B>) => C) => Type<F, C>
}

export interface Semialign2<F extends URIS2> extends Functor2<F> {
  readonly align: <L, A, B>(fa: Type2<F, L, A>, fb: Type2<F, L, B>) => Type2<F, L, These<A, B>>
  readonly alignWith: <L, A, B, C>(fa: Type2<F, L, A>, fb: Type2<F, L, B>, f: (x: These<A, B>) => C) => Type2<F, L, C>
}

export interface Semialign3<F extends URIS3> extends Functor3<F> {
  readonly align: <U, L, A, B>(fa: Type3<F, U, L, A>, fb: Type3<F, U, L, B>) => Type3<F, U, L, These<A, B>>
  readonly alignWith: <U, L, A, B, C>(
    fa: Type3<F, U, L, A>,
    fb: Type3<F, U, L, B>,
    f: (x: These<A, B>) => C
  ) => Type3<F, U, L, C>
}

export interface Semialign2C<F extends URIS2, L> extends Functor2C<F, L> {
  readonly align: <A, B>(fa: Type2<F, L, A>, fb: Type2<F, L, B>) => Type2<F, L, These<A, B>>
  readonly alignWith: <A, B, C>(fa: Type2<F, L, A>, fb: Type2<F, L, B>, f: (x: These<A, B>) => C) => Type2<F, L, C>
}

export interface Semialign3C<F extends URIS3, U, L> extends Functor3C<F, U, L> {
  readonly align: <A, B>(fa: Type3<F, U, L, A>, fb: Type3<F, U, L, B>) => Type3<F, U, L, These<A, B>>
  readonly alignWith: <A, B, C>(
    fa: Type3<F, U, L, A>,
    fb: Type3<F, U, L, B>,
    f: (x: These<A, B>) => C
  ) => Type3<F, U, L, C>
}

/**
 * `Option` instance extended with `Semialign`
 *
 * @since 0.0.3
 */
export const option: typeof O & Semialign1<typeof O.URI> = {
  ...O,
  /**
   * Apply a function to the values of two Option's, returning an Option with the result. Uses the `These` data type
   * to handle the possibility of non existing values.
   *
   * @example
   * import { some, none } from 'fp-ts/lib/Option'
   * import { These } from 'fp-ts/lib/These'
   * import { identity } from 'fp-ts/lib/function'
   * import { option } from 'fp-ts-contrib/lib/Semialign'
   *
   * const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => a + b)
   *
   * assert.deepStrictEqual(option.alignWith(some(1), some('a'), f), some('1a'))
   * assert.deepStrictEqual(option.alignWith(some(1), none, f), some('1'))
   * assert.deepStrictEqual(option.alignWith(none, some('a'), f), some('a'))
   * assert.deepStrictEqual(option.alignWith(none, none, f), none)
   *
   * @since 0.0.3
   */
  alignWith: <A, B, C>(fa: Option<A>, fb: Option<B>, f: (x: These<A, B>) => C): Option<C> => {
    if (fa.isSome() && fb.isSome()) {
      return some(f(both(fa.value, fb.value)))
    } else if (fa.isNone() && fb.isSome()) {
      return some(f(that(fb.value)))
    } else if (fa.isSome() && fb.isNone()) {
      return some(f(this_(fa.value)))
    } else {
      return none
    }
  },
  /**
   * Takes two Option's and returns an Option with a value corresponding to the inputs combined using the `These` data type.
   *
   * @example
   * import { some, none } from 'fp-ts/lib/Option'
   * import { both, this_, that } from 'fp-ts/lib/These'
   * import { option } from 'fp-ts-contrib/lib/Semialign'
   *
   * assert.deepStrictEqual(option.align(some(1), some('a')), some(both(1, 'a')))
   * assert.deepStrictEqual(option.align(some(1, none), some(this_(1)))
   * assert.deepStrictEqual(option.align(none, some('a')), some(that('a')))
   * assert.deepStrictEqual(option.align(none, none), none)
   *
   * @since 0.0.3
   */
  align: <A, B>(fa: Option<A>, fb: Option<B>): Option<These<A, B>> => option.alignWith(fa, fb, identity)
}

/**
 * `Array` instance extended with `Semialign`
 *
 * @since 0.0.3
 */
export const array: typeof A & Semialign1<typeof A.URI> = {
  ...A,
  /**
   * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array.
   * Uses the `These` data type to handle arrays of different lengths.
   *
   * @example
   * import { These } from 'fp-ts/lib/These'
   * import { identity } from 'fp-ts/lib/function'
   * import { array } from 'fp-ts-contrib/lib/Semialign'
   *
   * const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => a + b)
   *
   * assert.deepStrictEqual(array.alignWith([1, 2], ['a', 'b'], f), ['1a', '2b'])
   * assert.deepStrictEqual(array.alignWith([1, 2], ['a'], f), ['1a', '2'])
   * assert.deepStrictEqual(array.alignWith([1], ['a' 'b'], f), ['1a', 'b'])
   *
   * @since 0.0.3
   */
  alignWith: <A, B, C>(fa: Array<A>, fb: Array<B>, f: (x: These<A, B>) => C): Array<C> => {
    const fc = []
    const aLen = fa.length
    const bLen = fb.length
    const len = Math.min(aLen, bLen)
    for (let i = 0; i < len; i++) {
      fc[i] = f(both(fa[i], fb[i]))
    }
    if (aLen > bLen) {
      for (let i = bLen; i < aLen; i++) {
        fc[i] = f(this_<A, B>(fa[i]))
      }
    } else {
      for (let i = aLen; i < bLen; i++) {
        fc[i] = f(that<A, B>(fb[i]))
      }
    }
    return fc
  },
  /**
   * Takes two arrays and returns an array of corresponding pairs combined using the `These` data type.
   *
   * @example
   * import { These } from 'fp-ts/lib/These'
   * import { identity } from 'fp-ts/lib/function'
   * import { array } from 'fp-ts-contrib/lib/Semialign'
   *
   * assert.deepStrictEqual(array.align([1, 2], ['a', 'b']), [both(1, 'a'), both(2, 'b')])
   * assert.deepStrictEqual(array.align([1, 2], ['a']), [both(1, 'a'), this_(2)])
   * assert.deepStrictEqual(array.align([1], ['a' 'b']), [both(1, 'a'), that('b')])
   *
   * @since 0.0.3
   */
  align: <A, B>(fa: Array<A>, fb: Array<B>): Array<These<A, B>> => {
    return array.alignWith<A, B, These<A, B>>(fa, fb, identity)
  }
}

/**
 * `NonEmptyArray2v` instance extended with `Semialign`
 *
 * @since 0.0.3
 */
export const nonEmptyArray: typeof NA & Semialign1<typeof NA.URI> = {
  ...NA,
  /**
   * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array.
   * Uses the `These` data type to handle arrays of different lengths.
   *
   * @example
   * import { These } from 'fp-ts/lib/These'
   * import { identity } from 'fp-ts/lib/function'
   * import { nonEmptyArray } from 'fp-ts-contrib/lib/Semialign'
   *
   * const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => a + b)
   *
   * assert.deepStrictEqual(nonEmptyArray.alignWith(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b', 'c']), f), new NonEmptyArray('1a', ['2b', '3c']))
   * assert.deepStrictEqual(nonEmptyArray.alignWith(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b']), f), new NonEmptyArray('1a', ['2b', '3']))
   * assert.deepStrictEqual(nonEmptyArray.alignWith(new NonEmptyArray(1, [2]), new NonEmptyArray('a', ['b', 'c']), f), new NonEmptyArray('1a', ['2b', 'c']))
   *
   * @since 0.0.3
   */
  alignWith: <A, B, C>(fa: NonEmptyArray<A>, fb: NonEmptyArray<B>, f: (x: These<A, B>) => C): NonEmptyArray<C> => {
    return new NonEmptyArray(f(both(fa.head, fb.head)), array.alignWith(fa.tail, fb.tail, f))
  },
  /**
   * Takes two arrays and returns an array of corresponding pairs combined using the `These` data type.
   *
   * @example
   * import { These } from 'fp-ts/lib/These'
   * import { identity } from 'fp-ts/lib/function'
   * import { nonEmptyArray } from 'fp-ts-contrib/lib/Semialign'
   *
   * assert.deepStrictEqual(nonEmptyArray.align(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b', 'c']), new NonEmptyArray(both(1, 'a'), [both(2, 'b'), both(3, 'c')]))
   * assert.deepStrictEqual(nonEmptyArray.align(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b']), new NonEmptyArray(both(1, 'a'), [both(2, 'b'), this_(3)])
   * assert.deepStrictEqual(nonEmptyArray.align(new NonEmptyArray(1, [2]), new NonEmptyArray('a', ['b', 'c']), new NonEmptyArray(both(1, 'a'), [both(2, 'b'), that('c')]))
   *
   * @since 0.0.3
   */
  align: <A, B>(fa: NonEmptyArray<A>, fb: NonEmptyArray<B>): NonEmptyArray<These<A, B>> => {
    return new NonEmptyArray(both(fa.head, fb.head), array.align(fa.tail, fb.tail))
  }
}

function recordAlignWith<K extends string, P extends string, A, B, C>(
  fa: Record<K, A>,
  fb: Record<P, B>,
  f: (x: These<A, B>) => C
): Record<K | P, C>
function recordAlignWith<A, B, C>(
  fa: Record<string, A>,
  fb: Record<string, B>,
  f: (x: These<A, B>) => C
): Record<string, C>
function recordAlignWith<A, B, C>(
  fa: Record<string, A>,
  fb: Record<string, B>,
  f: (x: These<A, B>) => C
): Record<string, C> {
  const r: Record<string, C> = {}
  for (const key of Object.keys(fa)) {
    if (fb.hasOwnProperty(key)) {
      r[key] = f(both(fa[key], fb[key]))
    } else {
      r[key] = f(this_(fa[key]))
    }
  }
  for (const key of Object.keys(fb)) {
    if (!fa.hasOwnProperty(key)) {
      r[key] = f(that(fb[key]))
    }
  }
  return r
}

function recordAlign<K extends string, P extends string, A, B>(
  fa: Record<K, A>,
  fb: Record<P, B>
): Record<K | P, These<A, B>>
function recordAlign<A, B>(fa: Record<string, A>, fb: Record<string, B>): Record<string, These<A, B>>
function recordAlign<A, B>(fa: Record<string, A>, fb: Record<string, B>): Record<string, These<A, B>> {
  return recordAlignWith<A, B, These<A, B>>(fa, fb, identity)
}

/**
 * `Record` instance extended with `Semialign`
 *
 * @since 0.0.3
 */
export const record = {
  ...R,
  /**
   * Creates a union of two records by combining the elements at each key using the provided function.
   *
   * @example
   * import { These } from 'fp-ts/lib/These'
   * import { identity } from 'fp-ts/lib/function'
   * import { record } from 'fp-ts-contrib/lib/Semialign'
   *
   * const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => a + b)
   *
   * assert.deepStrictEqual(record.alignWith({ a: 1, b: 2 }, { a: 'a', b: 'b' }, f), { a: '1a', b: '2b' })
   * assert.deepStrictEqual(record.alignWith({ a: 1, b: 2 }, { a: 'a' }, f), { a: '1a', b: '2' })
   * assert.deepStrictEqual(record.alignWith({ a: 1 }, { a: 'a', b: 'b' }, f), { a: '1a', b: 'b' })
   *
   * @since 0.0.3
   */
  alignWith: recordAlignWith,
  /**
   * Takes two records and returns a record that corresponds to the union of those records.
   *
   * @example
   * import { both, this_, that } from 'fp-ts/lib/These'
   * import { record } from 'fp-ts-contrib/lib/Semialign'
   *
   * assert.deepStrictEqual(record.align({ a: 1, b: 2 }, { a: 'a', b: 'b' }), { a: both(1, 'a'), b: both(2, 'b') })
   * assert.deepStrictEqual(record.align({ a: 1, b: 2 }, { a: 'a' }), { a: both(1, 'a'), b: this_(2) })
   * assert.deepStrictEqual(record.align({ a: 1 }, { a: 'a', b: 'b' }), { a: both(1, 'a'), b: that('b') })
   *
   * @since 0.0.3
   */
  align: recordAlign
}

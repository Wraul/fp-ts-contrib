import * as assert from 'assert'
import { These, this_, that, both } from 'fp-ts/lib/These'
import { some, none } from 'fp-ts/lib/Option'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { identity } from 'fp-ts/lib/function'
import { option, array, record, nonEmptyArray } from '../src/Semialign'

describe('Semialign', () => {
  describe('Option', () => {
    it('align', () => {
      assert.deepStrictEqual(option.align(some(1), some('a')), some(both(1, 'a')))
      assert.deepStrictEqual(option.align(some(1), none), some(this_(1)))
      assert.deepStrictEqual(option.align(none, some('a')), some(that('a')))
      assert.deepStrictEqual(option.align(none, none), none)
    })

    it('alignWith', () => {
      const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => b + a)
      assert.deepStrictEqual(option.alignWith(some(1), some('a'), f), some('a1'))
      assert.deepStrictEqual(option.alignWith(some(1), none, f), some('1'))
      assert.deepStrictEqual(option.alignWith(none, some('a'), f), some('a'))
      assert.deepStrictEqual(option.alignWith(none, none, f), none)
    })
  })

  describe('Array', () => {
    it('align', () => {
      assert.deepStrictEqual(array.align([1, 2], ['a', 'b']), [both(1, 'a'), both(2, 'b')])
      assert.deepStrictEqual(array.align([1, 2], ['a']), [both(1, 'a'), this_(2)])
      assert.deepStrictEqual(array.align([1], ['a', 'b']), [both(1, 'a'), that('b')])
      assert.deepStrictEqual(array.align([1], []), [this_(1)])
      assert.deepStrictEqual(array.align([], ['a']), [that('a')])
      assert.deepStrictEqual(array.align([], []), [])
    })

    it('alignWith', () => {
      const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => b + a)
      assert.deepStrictEqual(array.alignWith([1, 2], ['a', 'b'], f), ['a1', 'b2'])
      assert.deepStrictEqual(array.alignWith([1, 2], ['a'], f), ['a1', '2'])
      assert.deepStrictEqual(array.alignWith([1], ['a', 'b'], f), ['a1', 'b'])
      assert.deepStrictEqual(array.alignWith([1], [], f), ['1'])
      assert.deepStrictEqual(array.alignWith([], ['a'], f), ['a'])
      assert.deepStrictEqual(array.alignWith([], [], f), [])
    })
  })

  describe('Record', () => {
    it('align', () => {
      assert.deepStrictEqual(record.align({ a: 1, b: 2 }, { a: 'a', b: 'b' }), { a: both(1, 'a'), b: both(2, 'b') })
      assert.deepStrictEqual(record.align({ a: 1, b: 2 }, { a: 'a' }), { a: both(1, 'a'), b: this_(2) })
      assert.deepStrictEqual(record.align({ a: 1 }, { a: 'a', b: 'b' }), { a: both(1, 'a'), b: that('b') })
      assert.deepStrictEqual(record.align({ a: 1 }, {}), { a: this_(1) })
      assert.deepStrictEqual(record.align({}, { a: 'a' }), { a: that('a') })
      assert.deepStrictEqual(record.align({}, {}), {})
    })

    it('alignWith', () => {
      const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => b + a)
      assert.deepStrictEqual(record.alignWith({ a: 1, b: 2 }, { a: 'a', b: 'b' }, f), { a: 'a1', b: 'b2' })
      assert.deepStrictEqual(record.alignWith({ a: 1, b: 2 }, { a: 'a' }, f), { a: 'a1', b: '2' })
      assert.deepStrictEqual(record.alignWith({ a: 1 }, { a: 'a', b: 'b' }, f), { a: 'a1', b: 'b' })
      assert.deepStrictEqual(record.alignWith({ a: 1 }, {}, f), { a: '1' })
      assert.deepStrictEqual(record.alignWith({}, { a: 'a' }, f), { a: 'a' })
      assert.deepStrictEqual(record.alignWith({}, {}, f), {})
    })
  })

  describe('NonEmptyArray', () => {
    it('align', () => {
      assert.deepStrictEqual(
        nonEmptyArray.align(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b', 'c'])),
        new NonEmptyArray(both(1, 'a'), [both(2, 'b'), both(3, 'c')])
      )
      assert.deepStrictEqual(
        nonEmptyArray.align(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b'])),
        new NonEmptyArray(both(1, 'a'), [both(2, 'b'), this_(3)])
      )
      assert.deepStrictEqual(
        nonEmptyArray.align(new NonEmptyArray(1, [2]), new NonEmptyArray('a', ['b', 'c'])),
        new NonEmptyArray(both(1, 'a'), [both(2, 'b'), that('c')])
      )
      assert.deepStrictEqual(
        nonEmptyArray.align(new NonEmptyArray(1, []), new NonEmptyArray('a', [])),
        new NonEmptyArray(both(1, 'a'), [])
      )
    })

    it('alignWith', () => {
      const f = (x: These<number, string>) => x.fold(a => a.toString(), identity, (a, b) => b + a)
      assert.deepStrictEqual(
        nonEmptyArray.alignWith(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b', 'c']), f),
        new NonEmptyArray('a1', ['b2', 'c3'])
      )
      assert.deepStrictEqual(
        nonEmptyArray.alignWith(new NonEmptyArray(1, [2, 3]), new NonEmptyArray('a', ['b']), f),
        new NonEmptyArray('a1', ['b2', '3'])
      )
      assert.deepStrictEqual(
        nonEmptyArray.alignWith(new NonEmptyArray(1, [2]), new NonEmptyArray('a', ['b', 'c']), f),
        new NonEmptyArray('a1', ['b2', 'c'])
      )
      assert.deepStrictEqual(
        nonEmptyArray.alignWith(new NonEmptyArray(1, []), new NonEmptyArray('a', []), f),
        new NonEmptyArray('a1', [])
      )
    })
  })
})

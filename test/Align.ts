import * as assert from 'assert'
import { semigroupSum } from 'fp-ts/lib/Semigroup'
import { Option, some, none } from 'fp-ts/lib/Option'
import { this_, that } from 'fp-ts/lib/These'
import {
  salign,
  padZip,
  padZipWith,
  lpadZip,
  lpadZipWith,
  rpadZip,
  rpadZipWith,
  option,
  array,
  record
} from '../src/Align'

describe('Align', () => {
  it('salign', () => {
    assert.deepStrictEqual(salign(array, semigroupSum)([1, 2], [4, 5]), [5, 7])
    assert.deepStrictEqual(salign(array, semigroupSum)([1, 2], [4]), [5, 2])
    assert.deepStrictEqual(salign(array, semigroupSum)([1], [4, 5]), [5, 5])
    assert.deepStrictEqual(salign(array, semigroupSum)([], []), [])
  })

  it('padZip', () => {
    assert.deepStrictEqual(padZip(array)([1, 2], ['a', 'b']), [[some(1), some('a')], [some(2), some('b')]])
    assert.deepStrictEqual(padZip(array)([1, 2], ['a']), [[some(1), some('a')], [some(2), none]])
    assert.deepStrictEqual(padZip(array)([1], ['a', 'b']), [[some(1), some('a')], [none, some('b')]])
    assert.deepStrictEqual(padZip(array)([], []), [])
  })

  it('padZipWith', () => {
    const f = (ma: Option<number>, mb: Option<string>) => mb.getOrElse('#') + ma.fold('*', a => a.toString())
    assert.deepStrictEqual(padZipWith(array)([1, 2], ['a', 'b'], f), ['a1', 'b2'])
    assert.deepStrictEqual(padZipWith(array)([1, 2], ['a'], f), ['a1', '#2'])
    assert.deepStrictEqual(padZipWith(array)([1], ['a', 'b'], f), ['a1', 'b*'])
    assert.deepStrictEqual(padZipWith(array)([], [], f), [])
  })

  it('lpadZip', () => {
    assert.deepStrictEqual(lpadZip([1, 2], ['a', 'b']), [[some(1), 'a'], [some(2), 'b']])
    assert.deepStrictEqual(lpadZip([1, 2], ['a']), [[some(1), 'a']])
    assert.deepStrictEqual(lpadZip([1], ['a', 'b']), [[some(1), 'a'], [none, 'b']])
    assert.deepStrictEqual(lpadZip([], []), [])
  })

  it('lpadZipWith', () => {
    const f = (ma: Option<number>, b: string) => b + ma.fold('*', a => a.toString())
    assert.deepStrictEqual(lpadZipWith([1, 2], ['a', 'b'], f), ['a1', 'b2'])
    assert.deepStrictEqual(lpadZipWith([1, 2], ['a'], f), ['a1'])
    assert.deepStrictEqual(lpadZipWith([1], ['a', 'b'], f), ['a1', 'b*'])
    assert.deepStrictEqual(lpadZipWith([], [], f), [])
  })

  it('rpadZip', () => {
    assert.deepStrictEqual(rpadZip([1, 2], ['a', 'b']), [[1, some('a')], [2, some('b')]])
    assert.deepStrictEqual(rpadZip([1, 2], ['a']), [[1, some('a')], [2, none]])
    assert.deepStrictEqual(rpadZip([1], ['a', 'b']), [[1, some('a')]])
    assert.deepStrictEqual(rpadZip([], []), [])
  })

  it('rpadZipWith', () => {
    const f = (a: number, mb: Option<string>) => mb.getOrElse('*') + a.toString()
    assert.deepStrictEqual(rpadZipWith([1, 2], ['a', 'b'], f), ['a1', 'b2'])
    assert.deepStrictEqual(rpadZipWith([1, 2], ['a'], f), ['a1', '*2'])
    assert.deepStrictEqual(rpadZipWith([1], ['a', 'b'], f), ['a1'])
    assert.deepStrictEqual(rpadZipWith([], [], f), [])
  })

  describe('Option', () => {
    it('nil', () => {
      assert.deepStrictEqual(option.align(some(1), option.nil<string>()), some(this_(1)))
      assert.deepStrictEqual(option.align(option.nil<number>(), some('a')), some(that('a')))
      assert.deepStrictEqual(option.align(option.nil<number>(), option.nil<string>()), none)
    })
  })

  describe('Array', () => {
    it('nil', () => {
      assert.deepStrictEqual(array.align([1], array.nil<string>()), [this_(1)])
      assert.deepStrictEqual(array.align(array.nil<number>(), ['a']), [that('a')])
      assert.deepStrictEqual(array.align(array.nil<number>(), array.nil<string>()), [])
    })
  })

  describe('Record', () => {
    it('nil', () => {
      assert.deepStrictEqual(record.align({ a: 1 }, record.nil<string>()), { a: this_(1) })
      assert.deepStrictEqual(record.align(record.nil<number>(), { a: 'a' }), { a: that('a') })
      assert.deepStrictEqual(record.align(record.nil<number>(), record.nil<string>()), {})
    })
  })
})

import test from 'ava'
import { Do } from '../index.js'

const ArrayDo = Do({
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])
})

const ___pure = x => [x]
const ___bind = xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])

test('context', t => {
    const m = [3, 4]
    console.log(
        ArrayDo(function * () {
            const x = yield [1, 2]
            console.log('m', m)
            const y = yield [2] // m
            return x * y
        })({ m })
    )
    // t.deepEqual(
    //     [3, 4, 6, 8],
    //     ArrayDo(function * () {
    //         const x = yield [1, 2]
    //         console.log('m', m)
    //         console.log('this.m', this)
    //         const y = yield m
    //         return x * y
    //     })
    // )
})

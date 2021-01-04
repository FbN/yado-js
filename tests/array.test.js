import test from 'ava'
import { Do } from '../index.js'

const ArrayDo = Do({
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])
})

test.only('array monad', t => {
    const doBlock = [
        { x: [1, 2] },
        { y: [3, 4] },
        s => ({ z: 1 }),
        {
            return: s => {
                console.log('scope', scope)
                return s.x + s.y + s.z
            }
        }
    ]

    t.deepEqual([3, 4, 6, 8], ArrayDo(doBlock)) // [3, 4, 6, 8]
})
//
// test('conditional expression', t => {
//     const doBlock = function * () {
//         const x = yield [1, 2]
//         const y = yield x > 1 ? [3, 4] : [5, 6]
//         return x * y
//     }
//     t.deepEqual([5, 6, 6, 8], ArrayDo(doBlock)) // [3, 4, 6, 8]
// })

import test from 'ava'
import { Do } from '../index.js'
import BurridoModule from 'burrido'
const Burrido = BurridoModule.default

const { bind, returns, to } = Do

const Monad = {
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])
}

const ArrayDo = Do(Monad)

const BurridoArrayDo = Burrido({
    ...Monad,
    bind: (xs, f) => Monad.bind(xs)(f)
}).Do

test('array monad', t => {
    const yado = [bind('x')([1, 2]), bind('y')([3, 4]), returns(s => s.x * s.y)]
    const burr = function * () {
        const x = yield [1, 2]
        const y = yield [3, 4]
        return x * y
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // [3, 4, 6, 8]
})

test('middle return', t => {
    const yado = [
        bind('x')([1, 2]),
        bind('y')([3, 4]),
        s => (s.x === 2 && s.y === 3 ? [returns(0)] : []),
        returns(s => s.x * s.y)
    ]
    const burr = function * () {
        const x = yield [1, 2]
        const y = yield [3, 4]
        if (x == 2 && y === 3) {
            return 0
        }
        return x * y
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // [ 3, 4, 0, 8 ]
})

test('early interruption', t => {
    const yado = [
        bind('x')([1, 2]),
        bind('y')([3, 4]),
        s => (s.x === 2 && s.y === 3 ? [returns(666)] : []),
        bind('z')([5, 6]),
        returns(s => s.x * s.y + s.z)
    ]
    const burr = function * () {
        const x = yield [1, 2]
        const y = yield [3, 4]
        if (x == 2 && y === 3) {
            return 666
        }
        const z = yield [5, 6]
        return x * y + z
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // [8,  9,  9, 10, 666, 13, 14]
})

test('for loop (with command)', t => {
    const yado = [
        bind('x')([1, 2]),
        bind('y')([3, 4]),
        to('out')([]),
        s =>
            [...Array(3).keys()].flatMap(() => [
                bind('_')([5, 6]),
                to('out')(s => [...s.out, s.x * s.y + s._])
            ]),
        returns(s => s.out)
    ]

    const burr = function * () {
        const x = yield [1, 2]
        const y = yield [3, 4]
        const out = [] // burrido reset this at every iteration
        for (let i = 0; i < 3; i++) {
            out.push(x * y + (yield [5, 6]))
        }
        return out
    }

    // [
    //   [ 8, 8, 8 ],    [ 8, 8, 9 ],    [ 8, 9, 8 ],
    //   [ 8, 9, 9 ],    [ 9, 8, 8 ],    [ 9, 8, 9 ],
    //   [ 9, 9, 8 ],    [ 9, 9, 9 ],    [ 9, 9, 9 ],
    //   [ 9, 9, 10 ],   [ 9, 10, 9 ],   [ 9, 10, 10 ],
    //   [ 10, 9, 9 ],   [ 10, 9, 10 ],  [ 10, 10, 9 ],
    //   [ 10, 10, 10 ], [ 11, 11, 11 ], [ 11, 11, 12 ],
    //   [ 11, 12, 11 ], [ 11, 12, 12 ], [ 12, 11, 11 ],
    //   [ 12, 11, 12 ], [ 12, 12, 11 ], [ 12, 12, 12 ],
    //   [ 13, 13, 13 ], [ 13, 13, 14 ], [ 13, 14, 13 ],
    //   [ 13, 14, 14 ], [ 14, 13, 13 ], [ 14, 13, 14 ],
    //   [ 14, 14, 13 ], [ 14, 14, 14 ]
    // ]
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado))
})

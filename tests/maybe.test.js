import test from 'ava'
import { Do } from '../index.js'
import BurridoModule from 'burrido'
const Burrido = BurridoModule.default

const Monad = {
    pure: x => x,
    bind: x => f => (x === null ? null : f(x))
}

const ArrayDo = Do(Monad)

const BurridoArrayDo = Burrido({
    ...Monad,
    bind: (xs, f) => Monad.bind(xs)(f)
}).Do

test('return just', t => {
    const yado = [
        { x: 3 },
        {
            return: s => s.x
        }
    ]
    const burr = function * () {
        const x = yield 3
        return x
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // 3
})

test('return nothing', t => {
    const yado = [
        { x: 3 },
        { y: null },
        {
            return: s => s.x + s.y
        }
    ]
    const burr = function * () {
        const x = yield 3
        const y = yield null
        return x + y
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // null
})

test('return in the middle', t => {
    const yado = [
        { x: 3 },
        { y: 2 },
        {
            return: 1
        },
        { z: 4 },
        {
            return: s => s.x + s.y
        }
    ]
    const burr = function * () {
        const x = yield 3
        const y = yield 2
        return 1
        const z = yield 4
        return x + y + z
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // null
})

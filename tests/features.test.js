import test from 'ava'
import { Do } from '../index.js'
import BurridoModule from 'burrido'
const Burrido = BurridoModule.default

const Monad = {
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])
}

const ArrayDo = Do(Monad)

const BurridoArrayDo = Burrido({
    ...Monad,
    bind: (xs, f) => Monad.bind(xs)(f)
}).Do

test('with scope', t => {
    const yado = [
        { x: [1, 2] },
        s => ({ ...s, z: 1 }),
        { y: [3, 4] },
        {
            return: s => s.x * s.y + s.z
        }
    ]
    const burr = function * () {
        const x = yield [1, 2]
        const z = 1
        const y = yield [3, 4]
        return x * y + z
    }
    t.deepEqual(BurridoArrayDo(burr), ArrayDo(yado)) // [ 4, 5, 7, 9 ]
})

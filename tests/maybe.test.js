import test from 'ava'
import { Do } from '../index.js'

const MaybeDo = Do({
    pure: x => x,
    bind: x => f => (x === null ? null : f(x))
})

test('maybe 1', t => {
    t.is(
        3,
        MaybeDo(function * () {
            const x = yield 3
            return x
        })
    )
})

test('maybe 2', t => {
    t.is(
        null,
        MaybeDo(function * () {
            const x = yield 3
            const y = yield null
            return x + y
        })
    )
})

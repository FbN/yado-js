import test from 'ava'
import { Do } from '../index.js'
import S from 'sanctuary'

const ArrayDo = Do(S.Maybe)

test('return just', t => {
    const yado = [{ x: S.Just(3), return: s => s.x }]
    t.deepEqual(3, S.maybeToNullable(ArrayDo(yado)))
})

test('return nothing', t => {
    const yado = [
        { x: S.Just(3) },
        { y: S.Nothing },
        { return: s => s.x + s.y }
    ]
    t.deepEqual(null, S.maybeToNullable(ArrayDo(yado))) // null
})

test('return in the middle', t => {
    const yado = [
        { x: S.Just(3) },
        { y: S.Just(2) },
        {
            return: 1
        },
        { z: S.Just(4) },
        {
            return: s => s.x + s.y
        }
    ]
    t.deepEqual(1, S.maybeToNullable(ArrayDo(yado)))
})

import { Do } from './index.js'

const ArrayDo = Do({
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])
})

const doBlock = [
    { x: [1, 2] },
    { y: [3, 4] },
    s => (s.x === 2 && s.y === 3 ? { return: () => 0 } : {}),
    // s => ({ z: [1] }),
    // {
    //     return: s => 0
    // },
    { k: [1, 2] },
    {
        return: s => {
            return s.x * s.y + s.k // + s.z
        }
    }
]

console.log(ArrayDo(doBlock))

const RESULT = 'return'

const I = s => s

const isFunction = statement => typeof statement === 'function'

const resultOrChain = chain => scope =>
    scope[RESULT] !== undefined ? scope[RESULT] : chain(scope)

const tokenChain = ({ pure, bind }) => (chain, [token, argument]) => {
    if (token === 'return') {
        return scope =>
            chain({
                ...scope,
                [RESULT]: pure(
                    isFunction(argument) ? argument(scope) : argument
                )
            })
    }
    return scope => bind(argument)(v => chain({ ...scope, [token]: v }))
}

const blockResolve = Monad => {
    const tokenChainBinded = tokenChain(Monad)
    return statemens => (chain = I) =>
        [...statemens].reverse().reduce((chain, statement) => {
            if (isFunction(statement)) {
                return resultOrChain(scope => {
                    const res = statement(scope)
                    return Array.isArray(res)
                        ? blockResolve(Monad)(res)(chain)(scope)
                        : chain(res)
                })
            }
            return Object.entries(statement)
                .reverse()
                .reduce(
                    (...args) => resultOrChain(tokenChainBinded(...args)),
                    chain
                )
        }, chain)
}

const Do = ({ pure, bind }) => statemens =>
    blockResolve({ pure, bind })(statemens)(scope => scope[RESULT])({})

// Command utility
const bind = identifier => argument => ({ [identifier]: argument })
const returns = argument => ({ return: argument })
const to = identifier => argument => scope =>
    Object.assign({}, scope, {
        [identifier]: isFunction(argument) ? argument(scope) : argument
    })

Do.bind = bind
Do.returns = returns
Do.to = to

export { Do }

const RESULT = 'return'

const fantasy = {
    of: 'fantasy-land/of',
    chain: 'fantasy-land/chain'
}

const I = s => s

const isFunction = statement => typeof statement === 'function'

const resultOrChain = chain => scope =>
    scope[RESULT] !== undefined ? scope[RESULT] : chain(scope)

const resolveArgument = (argument, scope) =>
    isFunction(argument) ? argument(scope) : argument

const tokenChain = ({ pure, bind }) => (chain, [token, argument]) => {
    if (token === 'return') {
        return scope =>
            chain({
                ...scope,
                [RESULT]: pure(resolveArgument(argument, scope))
            })
    }
    return scope =>
        bind(resolveArgument(argument, scope))(v =>
            chain({ ...scope, [token]: v })
        )
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

const getMonad = MonadDef =>
    MonadDef[fantasy.of]
        ? {
            pure: MonadDef[fantasy.of],
            bind: x => f => x[fantasy.chain](f)
        }
        : MonadDef

const Exe = MonadDef => statemens =>
    blockResolve(getMonad(MonadDef))(statemens)(scope => scope[RESULT])

const Do = MonadDef => statemens => Exe(MonadDef)(statemens)({})

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

export { Do, Exe }

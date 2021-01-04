// ArrayDo([
//     { a: [1, 2] },
//     { b: [2, 3] },
//     { return: s => s.a + s + b }
// ])
//     s => (s.a > 1 ? { c: [2, 3] } : { return: s.a + s.b }),

const isFunction = statement => typeof statement === 'function'

const isReturn = statement => !!statement?.return

const Do = ({ pure, bind }) => statemens =>
    [...statemens].reverse().reduce(
        function reducer(chain, statement) {
            if (isFunction(statement)) {
                return scope => reducer(chain, statement(scope))(scope)
            }
            if (isReturn(statement)) {
                return scope => bind(pure(statement.return(scope)))(chain)
            }
            return Object.entries(statement)
                .reverse()
                .reduce(
                    (chain, [identifier, argument]) => scope =>
                        bind(argument)(v =>
                            chain({ ...scope, [identifier]: v })
                        ),
                    chain
                )
        },
        scope => scope
    )({})

export { Do }

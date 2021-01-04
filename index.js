// ArrayDo([
//     { a: [1, 2] },
//     { b: [2, 3] },
//     { return: s => s.a + s + b }
// ])
//     s => (s.a > 1 ? { c: [2, 3] } : { return: s.a + s.b }),

const RESULT = Symbol()

const isFunction = statement => typeof statement === 'function'

const isReturn = statement => !!statement?.return

const Do = ({ pure, bind }) => statemens =>
    [...statemens].reverse().reduce(
        function reducer(chain, statement) {
            if (isFunction(statement)) {
                return scope =>
                    scope[RESULT] !== undefined
                        ? scope[RESULT]
                        : reducer(chain, statement(scope))(scope)
            }
            if (isReturn(statement)) {
                return scope =>
                    scope[RESULT] !== undefined
                        ? scope[RESULT]
                        : chain({
                              ...scope,
                              [RESULT]: pure(statement.return(scope))
                          })
            }
            return Object.entries(statement)
                .reverse()
                .reduce(
                    (chain, [identifier, argument]) => scope =>
                        scope[RESULT] !== undefined
                            ? scope[RESULT]
                            : bind(argument)(v =>
                                  chain({ ...scope, [identifier]: v })
                              ),
                    chain
                )
        },
        scope => scope[RESULT]
    )({})

export { Do }

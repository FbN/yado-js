const RESULT = Symbol()

const isFunction = statement => typeof statement === 'function'

const isReturn = statement => statement?.return !== undefined

const resultOrChain = chain => scope =>
    scope[RESULT] !== undefined ? scope[RESULT] : chain(scope)

const Do = ({ pure, bind }) => statemens =>
    [...statemens].reverse().reduce(
        function reducer(chain, statement) {
            if (isFunction(statement)) {
                return resultOrChain(scope =>
                    reducer(chain, statement(scope))(scope)
                )
            }
            if (isReturn(statement)) {
                return resultOrChain(scope =>
                    chain({
                        ...scope,
                        [RESULT]: pure(
                            isFunction(statement.return)
                                ? statement.return(scope)
                                : statement.return
                        )
                    })
                )
            }
            return Object.entries(statement)
                .reverse()
                .reduce(
                    (chain, [identifier, argument]) =>
                        resultOrChain(scope =>
                            bind(argument)(v =>
                                chain({ ...scope, [identifier]: v })
                            )
                        ),
                    chain
                )
        },
        scope => scope[RESULT]
    )({})

export { Do }

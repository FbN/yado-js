[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/FbN/yado-js">
    <img src="https://raw.githubusercontent.com/FbN/yado-js/HEAD/images/logo.png" alt="YADO JS" width="400">
  </a>

  <h3 align="center">Yet Another <strong>Do-Notation</strong> for Javascript</h3>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

-   [About the Project](#about-the-project)
-   [Getting Started](#getting-started)
-   [Usage](#usage)
-   [Statements Types](#statements-types)
-   [Fantasy Land](#fantasy-land)
-   [License](#license)
-   [Contact](#contact)
-   [Related and similar projects](#related-and-similar-projects)

<!-- ABOUT THE PROJECT -->

## About The Project

Haskell [Do-Notation](https://en.wikibooks.org/wiki/Haskell/do_notation) is a great feature too works with monads.

There are different attempts to bring it Javascript world, that I can resume in these types:

-   **Generator based**: Use generator functions and yield instruction as Haskell bind operator. This would be a great solution but with a very [heavy drawback](https://github.com/pelotom/burrido#caveats).

-   **Language Extension**: Extend Javascript language to desugar your do code to vanilla javascript. This requires to precompile your code or use eval to dynamic evaluate your "just in time" desugared code (what about debugging? IDE?).

-   **Emulate by Data structure**: The case of this library. We use a vanilla javascript data structure that will be interpreted as Do notation. This brings:

    -   😄 Vannilla javascript. No pre-compilation / eval.

    -   😄 Support non-deterministic Monads.

    -   😄 Computationally Efficient

    -   😔 Non as clean to write/read as generators or language extension.

<!-- GETTING STARTED -->

## Getting Started

Add to your project

```sh
yarn add yado-js
```

<!-- USAGE EXAMPLES -->

## Usage

You write your Do block as an array of statements.

Every statement is a Javascript object or a function.

We have three types of objects: bind, returns, and to.

You can write these objects directly or using a utility function.

Do keep all declared vars in an object that we call scope (it's like the javascript local scope in the case of the generator function). So every statement can act and change the vars in the scope (see the section about function to discover more).

Let's discover by samples:

_Burrido version_

```js
import BurridoModule from 'burrido'
const Burrido = BurridoModule.default

const ArrayDo = Burrido({
    pure: x => [x],
    bind: (xs, f) => xs.map(f).reduce((a, b) => a.concat(b)
}).Do

ArrayDo(function * () {
    const x = yield [1, 2]
    const y = yield [3, 4]
    return x * y
}) // [3, 4, 6, 8]
```

_Yado version (no utility function)_

```js
import { Do } from 'yado-js'

const ArrayDo = Do({
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b)
})

ArrayDo([
    { x: [1, 2] },
    { y: [3, 4] },
    {return: s => s.x * s.y}
]) // [3, 4, 6, 8]
```

_Yado version (using utility function)_

```js
import {Do, bind, returns} from 'yado-js'

const ArrayDo = Do({
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b)
})

ArrayDo([
    bind('x')([1, 2]),
    bind('y')([3, 4]),
    returns(s => s.x * s.y)
]) // [3, 4, 6, 8]
```

**See below for more example and use cases**

<!-- STATEMENTS -->
## Statements Types

Every element of the array passed to Do function is can be a plain object or a function and interpreted as described below.

### Objects

-   [`bind`](#bind)
-   [`return`](#return)
-   [`to`](#to)

### Function

-   [`Statement Returning`](#statements-returning)
-   [`Scope Returning`](#scope-returning)

## Objects

### bind

Every plain object with keys that are not javascript reserver words (not this to be clear {return: 0})

#### Example:

```js
import { Do } from 'yado-js'

const ArrayDo = Do({
    pure: x => [x],
    bind: xs => f => xs.map(f).reduce((a, b) => a.concat(b), [])
})

ArrayDo([
    { x: [1, 2] },
    { y: [3, 4] },
    { return: s => s.x * s.y } // [3, 4, 6, 8]
])

```
In the example the object { x: [1, 2] } is desugared to as we call bind on the argument and assign result to x.

```js
bind([1, 2])(x => bind([3, 4])(y => pure(x * y)))
```

Is possible to group many binds in the same statement object:
```js
// see up for ArrayDo init
ArrayDo([
    { x: [1, 2], y: [3, 4] },
    { return: s => s.x * s.y } // [3, 4, 6, 8]
])
```

Instead of directly set a monad instance as argument we can pass a function that takes as input the scope and return a monad instance.

```js
// see up for ArrayDo init
ArrayDo([
    { x: [1, 2] },
    { y: s => [s.x + 1, s.x + 4] },
    { return: s => s.x * s.y }
])
```

same as:

```js
bind([1, 2])(x => bind([x + 3, x + 4])(y => pure(x * y)))
```

---

### return

Statement used to return and the Do block. Take as argument a function from _scope_ to a value to be returned or directly a value.

We can have many return statements, look at this sample:

```js
// see up for ArrayDo init
ArrayDo([
    { x: [1, 2] },
    { y: [3, 4] },
    s => (s.x === 2 && s.y === 3 ? [{ return: 0 }] : []),
    { return: s => s.x * s.y }
]) // [ 3, 4, 0, 8 ]
```

We can write it with utility functions:

```js
// see up for ArrayDo init
ArrayDo([
    bind('x')([1, 2]),
    bind('y')([3, 4]),
    s => (s.x === 2 && s.y === 3 ? [returns(0)] : []),
    returns(s => s.x * s.y)
]) // [ 3, 4, 0, 8 ]
```

N.B. The utility function is named return**s** for obvious reason.

---

### to

Shortcut to set a value into the scope.

```js
// see up for ArrayDo init
ArrayDo([
    bind('x')([1, 2]),
    bind('y')([3, 4]),
    to('z')(s => s.x === 2 && s.y === 3)
    s => (s.z ? [returns(0)] : []),
    returns(s => s.x * s.y)
]) // [ 3, 4, 0, 8 ]
```

The above is like.

```js
// see up for ArrayDo init
ArrayDo([
    { x: [1, 2] },
    { y: [3, 4] },
    s => ({ ...s, z: s.x === 2 && s.y === 3 }),
    s => (s.z ? [{ return: 0 }] : []),
    { return: s => s.x * s.y }
]) // [ 3, 4, 0, 8 ]
```

---

## functions

When the statement is a function will be executed taking the scope as argument. The function can return two types: Array or Object.

### scope => []

Function that returns an array of additional statements that will be interpreted before continue.

```js
// see up for ArrayDo init
ArrayDo([
    bind('x')([1, 2]),
    bind('y')([3, 4]),
    s => (s.x === 2 && s.y === 3 ? [returns(0)] : []),
    returns(s => s.x * s.y)
]) // [ 3, 4, 0, 8 ]
```

---

### scope => {}

A function that returns an object. The object will replace the block scope.

```js
// see up for ArrayDo init
ArrayDo([
    bind('x')([1, 2]),
    bind('y')([3, 4]),
    s => ({ ...s, z: 1 }),
    returns(s => s.x * s.y)
]) // [ 4, 5, 7, 9 ]
```
---

<!-- FANTASYLAND -->
## Fantasy Land

The Do function recognize fantasy land compliant monads

```js
import { Do } from 'yado-js'
import S from 'sanctuary'

const MaybeDo = Do(S.Maybe)

MaybeDo([
    { x: S.Just(3) },
    { y: S.Nothing },
    { return: s => s.x + s.y }
]) // null
```

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Fabiano Taioli - ftaioli@gmail.com

Project Link: [https://github.com/FbN/yado-js](https://github.com/FbN/yado-js)

<!-- RELATED -->
## Related and similar projects

Some library found looking around. In no any special order.

-   [Burrido](https://github.com/pelotom/burrido):
    Based on generator functions. Must re-run computation for every value. Pure and bind must be side-effect free. Inefficient, requiring O(n^2).
-   [Fantasy Do](https://github.com/russellmcc/fantasydo):
    Same as Burrido but target Fantasy land compliant monads. Same pro/contro.
-   [Monadic](https://github.com/five-eleven/monadic):
    Javascript language expansion. Compiled or by code eval.
-   [@masaeedu/do](https://github.com/masaeedu/do):
    Similar to this project. You must declare binded vars at start. Lack features (many return points).
-   [monadicjs](https://github.com/coot/monadicjs):
-   [monio](https://github.com/getify/monio):
    Use generator and promises. Do not support non deterministic monads.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/FbN/yado-js.svg?style=flat-square
[contributors-url]: https://github.com/FbN/yado-js/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/FbN/yado-js.svg?style=flat-square
[forks-url]: https://github.com/FbN/yado-js/network/members
[stars-shield]: https://img.shields.io/github/stars/FbN/yado-js.svg?style=flat-square
[stars-url]: https://github.com/FbN/yado-js/stargazers
[issues-shield]: https://img.shields.io/github/issues/FbN/yado-js.svg?style=flat-square
[issues-url]: https://github.com/FbN/yado-js/issues
[license-shield]: https://img.shields.io/github/license/FbN/yado-js.svg?style=flat-square
[license-url]: https://github.com/FbN/yado-js/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png

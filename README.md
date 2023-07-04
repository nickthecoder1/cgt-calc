# cgt-calc

[Click here to see the github page of this repo](https://nickthecoder1.github.io/cgt-calc/)

This is a tool for performing calculations in combinatorial game
theory.  It is written in JavaScript as a client-side web application.
Some version is posted
[on the original git owner's website](https://math.berkeley.edu/~willij/calc/calculator.html)
The current version is extremely preliminary.

## Usage
Currently, the tool reads in expressions from the provided input boxes, evaluates
them, and correspondingly does whatever operation is selected from the dropdown. 
Variables can be assigned by writing things like

    >> x = {0| }
    >> y = {0|}-{1|x}

Currently, the calculator knows about simplified diatic fractions, up, down, some stars, and a few other games,
but you must manually add anything else like \*6, doubleup\*, and so on:

    >> *6 = {0,*,*2,*3,*4,*5}
    >> doubleup* = {0|*} + {0|*} + *

Values are output in canonical form.  When possible, the output is
described using values that have been named:

    >> 4+*
    {4|4}
    >> 4* = 4+*
    4* = {4|4}
    >> 4+*
    4*
    
To get the canonical form of a named variable, you can enter its name

    >> 1*
    {1|1}


The following special syntaxes are supported:

* `{A,B,C}` for impartial games.  For instance,

        >> star = {0}
        >> *2 = {0,star}
        >> *3 = {0,star,*2}
        >> pm1 = {1,-1}

* Syntax like `{1||2|3}` for {1|{2|3}}.
* `A.B` for Norton Multiplication of A times B.
* `N` or `-N` where N is just any positive integer, will automatically be turned into the correct game representing that integer.
* `N_N/N` where the second number is odd and less than the third number, and the third number is a power of two. For instance,

        >> 2_1/2
        {2|3}
        >> 3_1/4
        {3|3_1/2}
        >> 1/16
        {0|1/8}
        >> {10|11}
        10_1/2

## Features
Currently, the only things implemented are a parser, and a very basic
engine for manipulating partizan games, supporting the following
operations:

* Building games out of their options (the {|} operator).
* Adding, subtracting, and negating games.
* Comparing games
* Finding the canonical form.

Additional features added by this fork:

* Norton Multiplication
* Automatic conversion from any diatic fraction into games and vice versa (1/2 <=> {0|1}, 2_1/2 <=> {1|2}, 3_1/4 <=> {3|3_1/2})
* Cool games
* Heat, overheat, and assymetrically heat games
* Analyze games' atomic weights

## Future goals

* Sometime soon, I plan on implementing a thermograph to analyze hot games. 
* I may add an checkbox that enables/disables the automatic addition of any diatic number. I'm not completely decided on whether I want to spend the effort.
* Similarly to the original github owner, in the much farther future I may add games like domineering or hackenbush to be able to analyze.

I still haven't actually finished all 4 volumes of _Winning Ways for Your Mathematical Plays_, but I imagine, I'll continue adding more as I follow along with the books.


## Background on CGT
Combinatorial game theory is the study of two player games of perfect
information, without chance.  Central to the subject is Conway,
Guy, and Berlekamp's theory of partizan games, detailed in their books
_On Numbers and Games_ and _Winning Ways_.

In this theory, one assumes the "normal play rule": __the loser is the
first player unable to move on his/her turn__.  Games like
[Nim](https://en.wikipedia.org/wiki/Nim),
[Amazons](https://en.wikipedia.org/wiki/Game_of_the_Amazons), and
[Domineering](https://en.wikipedia.org/wiki/Domineering) work this
way.  Unfortunately, more common games like Chess and Checkers fall
outside the scope of the theory.

A quick summary of the theory:

1. The two players are named Left and Right, for typographical reasons.
2. There is a partially ordered abelian group of "values".
3. Each position in each game is assigned a value from this group.
4. The outcome of a position under perfect play is determined by
comparing the value of the game to 0.
  * A position *P* is a win for Left,
with Left to move, if and only if *P* &#8816; 0.
  * A position *P* is a win for Right,
with Right to move, if and only if *P* &#8817; 0.
5. When two positions *P* and *Q* are played "in parallel," the value
of the combined position is *P*+*Q*.
  * This makes the theory particularly useful when positions naturally
    break into pieces.
6. When the roles of Left and Right are reversed, the value of a position
is negated.
7. Two positions are "equivalent" if they have the same value.
8. Each value is represented by a canonical position of minimal complexity,
   called the "canonical form" of the game.
9. If *A*, *B*, *C* and *D* are positions, then {*A*, *B*|*C*, *D*}
denotes a position where Left can move to *A* and *B*, and Right can
move to *C* and *D*.





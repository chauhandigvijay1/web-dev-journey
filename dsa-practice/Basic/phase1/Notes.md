# STARTED THINGS TO KNOW IN C++

---

# 1. Input Output

## Syntax
- Input: `cin >> variable;`
- Output: `cout << variable;`

---

# 2. Basics of C++

- "Using namespace std" after header file allows to not write std:: everytime after cin & cout 

- To end the line use "endl" or "/n"

- Using #Library file in every program is very lengthy that's why we use "#include<bits/stdc++.h>"

## Datatype

- use "int, long, long long based on the size of number" to store integer values

- To store decimal values use "float, double" based on its size

- To store character and string use "char or string"

- To print the whole line use "getline" - getline(cin, str)

---

# 3. if else statement

## if

* used when code should run only if the condition is true

* used for simple decision making

* if the condition is false, the code inside `if` will not run

* condition is written inside round brackets `()`

## if-else

* if one condition is true, one block runs, otherwise the other block runs

* used when there are only two possible cases

* commonly used in even-odd, positive-negative type problems

* if `if` runs, `else` will not run

## if-else-if

* used to check multiple conditions

* conditions are checked from top to bottom

* the first true condition gets executed

* once one condition becomes true, the remaining part is skipped

* `else` at the end is optional

## nested if-else

* when one `if` is written inside another `if`

* used when one decision depends on another decision

* should be used carefully otherwise code becomes confusing

* useful in eligibility / category type questions

## important points

* comparison operators are used in conditions like `==`, `!=`, `>`, `<`, `>=`, `<=`

* logical operators are also used like `&&`, `||`, `!`

* `=` is assignment, `==` is comparison

* using curly braces `{}` is better for readability

---

# 4. switch case

* used to compare one variable with multiple fixed values

* it is a clean alternative of if-else (when exact values are given)

* very useful in menu driven or choice based problems

## important points

* mostly used with `int` and `char`

* `break` after every case is important

* `default` runs when no case matches

* if `break` is not used, next cases also get executed (fall-through)

* range or complex conditions cannot be written in switch

* it compares one variable with different exact values

* `break` is not used after `default`

## difference

* if-else → for range and complex conditions

* switch → for fixed values (menu, days, choice)

* if-else is more flexible

* switch looks cleaner and more readable in fixed options

---

# 5. Arrays

* array is a collection of elements of same datatype

* used to store multiple values in a single variable name

* elements are stored in contiguous memory locations

* array size is fixed at the time of declaration

* index always starts from `0`

---

## 5.1  1D Array

* 1D array stores elements in a single line

* each element is accessed using one index

### Syntax

* declaration → `datatype arrayName[size];`

* example → `int arr[5];`

### important points

* first element is at index `0`

* last element is at index `size - 1`

* all elements have same datatype

* direct access is possible using index

* useful for storing marks, numbers, list of values, etc.

### common uses

* storing list of numbers

* finding sum, max, min

* counting frequency in basic problems

* traversal based questions

---

## 5.2  2D Array

* 2D array is an array of arrays

* used to represent data in rows and columns

* looks like a table or matrix

* each element is accessed using two indices

### Syntax

* declaration → `datatype arrayName[rows][cols];`

* example → `int arr[3][4];`

### important points

* first index → row number

* second index → column number

* index starts from `0`

* total elements = rows × columns

* each row contains multiple columns

### common uses

* matrices in problems

* grid based questions

* storing table-like data

* pattern and nested loop problems

### traversal

* row-wise traversal → go row by row

* column-wise traversal → go column by column

* mostly nested loops are used

---

## 5.3  Common Important Points for Arrays

* array stores only same type of data

* array size is fixed

* accessing invalid index leads to undefined behavior

* traversal means visiting each element one by one

* arrays are fast because direct access by index is possible

* insertion and deletion in between is not easy

---

## 5.4  Difference (1D vs 2D Array)

* 1D array → single index

* 2D array → two indices (`row`, `column`)

* 1D → linear structure

* 2D → table / matrix structure

* 1D → mostly for list of values

* 2D → mostly for matrix / grid problems

---

# 6. Strings (Basic)

* string is used to store sequence of characters

* in C++ strings can be handled using `string` datatype

* string is dynamic (size can change)

* index also starts from `0`

## Syntax

* declaration → `string str;`

* input word → `cin >> str;`

* input full line → `getline(cin, str);`

## important points

* string can store words and sentences

* spaces are not taken by normal input (`cin`), use `getline` for full line

* characters of string can be accessed using index

* string supports many built-in functions

* string length can be found using `.length()` or `.size()`

* strings are easier to use than character arrays

## common operations

* concatenation → joining two strings

* comparison → checking if two strings are equal

* traversal → accessing each character

* modification → changing characters using index

## useful built-in functions

* `.length()` / `.size()` → gives length of string

* `+` → joins two strings

## difference (array vs string)

* array → stores any datatype (same type), fixed size

* string → stores characters, dynamic size

* array → manual handling required

* string → many built-in functions available

---

# 7. Loops

* loops are used to repeat the same work multiple times

* manual repetition is avoided (code becomes shorter)

* used when the same logic has to run again and again

* very useful in counting, traversal, patterns and repetitive tasks

---

## 7.1 Types of Loops

* `for` → when number of iterations is known

* `while` → when loop should run based on a condition

* `do-while` → when loop must run at least once

---

## 7.2 for loop

* mostly used in counting based problems

* syntax is compact

* initialization, condition and update are written in one place

* best for printing numbers / fixed repetition

### Syntax

* `for(initialization; condition; update)`

### best way to understand

* use it when you know **how many times** loop should run

* example use cases:

  * print numbers from 1 to 10
  * run loop 5 times
  * traverse an array

### important points

* initialization runs only once

* condition is checked before every iteration

* update runs after every iteration

---

## 7.3 while loop

* useful when exact number of iterations is not known

* condition is checked first, then loop runs

* if condition is false in the beginning, loop will not run even once

### Syntax

* `while(condition)`

### best way to understand

* use it when loop should continue **until some condition changes**

* example use cases:

  * keep taking input until user enters 0
  * run until a number becomes 1

### important points

* initialization is usually done before loop

* update is usually written inside loop

* if update is missed, infinite loop may happen

---

## 7.4 do-while loop

* code runs first, then condition is checked

* loop executes at least once

* useful in menu / input validation type cases

### Syntax

* `do { } while(condition);`

### best way to understand

* use it when you want code to run **at least one time**, no matter what

* example use cases:

  * menu based programs
  * asking user again and again until valid input is given

### important points

* semicolon `;` after `while(condition)` is important

* even if condition is false, loop runs one time

---

## 7.5 Common Important Points

* a loop mainly has 3 parts → initialization, condition, update

* infinite loop happens when condition never becomes false

* `break` → stops the loop immediately

* `continue` → skips current iteration and moves to next one

* nested loops → loop inside another loop (useful in patterns, matrices)

* updating loop variable correctly is very important

* off-by-one error is a very common beginner mistake

* loop condition should be written carefully to avoid extra or fewer iterations

---

## 7.6 Best Way to Understand Loops

* loop means **repeat until condition says stop**

* think like this:

  * start
  * check condition
  * run code
  * update
  * repeat

* if condition becomes false, loop stops

---

## 7.7 Difference

* for loop → compact, mostly for counting based problems

* while loop → when iterations are not fixed

* do-while → when at least one execution is required

* for loop is used more in beginner

* array is a collection of elements of same datatype

* used to store multiple values in a single variable name

* elements are stored in contiguous memory locations

* array size is fixed at the time of declaration

* index always starts from `0`

---

# 8. Functions

* function is a block of code that performs a specific task

* used to avoid writing same code again and again

* helps in making code clean, short and reusable

* one function can be called many times

---

## 8.1 Syntax

* declaration / prototype → tells compiler about function

* definition → actual code of function

* function call → used to run the function

### Basic Syntax

* `returnType functionName(parameters)`

### Example

* `int sum(int a, int b)`

---

## 8.2 Parts of a Function

* **return type** → tells what function will return

* **function name** → name used to call the function

* **parameters** → input values passed to function

* **function body** → actual logic inside function

* **return statement** → sends value back

---

## 8.3 Types of Functions

### 1. No parameter, no return

* takes nothing and returns nothing

### 2. With parameter, no return

* takes input but does not return value

### 3. No parameter, with return

* takes nothing but returns value

### 4. With parameter, with return

* takes input and also returns value

* this is the most commonly used type

---

## 8.4 Parameters and Arguments

* **parameter** → variable written in function definition

* **argument** → actual value passed during function call

### best way to understand

* parameter = placeholder

* argument = real value

### Example

* `int sum(int a, int b)` → `a` and `b` are parameters

* `sum(2, 3)` → `2` and `3` are arguments

---

## 8.5 Return Type

* if function returns a value, write its datatype as return type

* if function returns nothing, use `void`

### important points

* `return` ends the function

* after `return`, remaining code inside function does not run

---

## 8.6 Function Prototype

* function prototype tells compiler that function exists

* useful when function is written below `main()`

### Example

* `int sum(int a, int b);`

---

## 8.7 Pass by Value

* in pass by value, a copy of variable is sent to function

* original variable does not change

* changes happen only in copied value inside function

### Syntax Idea

* `void fun(int x)`

### Example Idea

* if `a = 10` and function changes `x = 20`

* original `a` will still remain `10`

### best way to understand

* function gets its **own separate copy**

* whatever happens inside function stays inside function

---

## 8.8 Pass by Reference

* in pass by reference, original variable is sent to function

* changes made inside function directly affect original variable

* `&` is used in parameter

### Syntax Idea

* `void fun(int &x)`

### Example Idea

* if `a = 10` and function changes `x = 20`

* original `a` will also become `20`

### best way to understand

* function works on the **real variable**, not on a copy

* whatever changes happen inside function, original value also changes

### important point

* `&` in function parameter means reference
* Arrays aslways go with pass by reference   

---

## 8.9 Difference (Pass by Value vs Pass by Reference)

* pass by value → copy is passed

* pass by reference → original variable is passed

* pass by value → original variable remains unchanged

* pass by reference → original variable can change

* pass by value → extra memory used for copy

* pass by reference → no extra copy of variable

---

## 8.10 Functions with Arrays

* arrays are commonly passed to functions

* function can work on array elements one by one

* usually array name itself is passed

### important points

* changes in array inside function usually affect original array

* size of array is often passed separately

### Syntax Idea

* `fun(arr, n)`

### common uses

* sum of array

* maximum element

* reverse array

* count even / odd numbers

---

## 8.11 Functions with Strings

* strings can also be passed to functions

* useful for checking palindrome, counting vowels, reversing string, etc.

### important points

* can be passed by value or by reference

* pass by reference is better when string is large or needs modification

### Syntax Idea

* `fun(str)`

* `fun(string &str)` → when original string should be modified

---

## 8.12 Function Overloading

* function overloading means same function name with different parameters

* compiler decides which function to call based on arguments

### important points

* function name remains same but parameter list changes

* return type alone cannot decide overloading

### best way to understand

* same task, but different input forms

* example idea:

  * one function for 2 numbers
  * another function for 3 numbers

---

## 8.13 Scope in Functions

* scope means where a variable can be used

### types

* **local variable** → declared inside function, usable only there

* **global variable** → declared outside all functions, usable in whole program

---

## 8.14 Best Summary

* function = reusable block of code

* declaration → tells compiler

* definition → actual work

* call → runs the function

* pass by value → copy sent

* pass by reference → original sent using `&`

* functions are one of the most important concepts in programming



# COMPLETED - THINGS TO KNOW IN C++

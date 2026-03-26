### Swap Numbers

* Exchange two values
* 3 ways: temp variable, math (+ -), destructuring

### Largest of 3

* Compare all numbers
* The biggest one is the answer

### Even / Odd

* Number % 2 == 0 → Even
* Otherwise → Odd

### Leap Year

* Divisible by 4
* Not divisible by 100 (unless divisible by 400)

### Sum of Digits

* Take last digit (%10)
* Add it
* Reduce number (/10)

### Reverse Number

* Take last digit
* Add in front (rev * 10 + digit)

### Palindrome

* number = original
* Reverse == original → Palindrome

### Armstrong

* num.toString().length → length
* Sum of (digit ^ total digits)
* If equal → Armstrong

### Count Digits

* Keep dividing by 10
* Count steps

## Patterns

### Trick

* 1. Total rows kitni hain?
* 2. Har row me stars/numbers kitne hain?
* 3. Space kitni hai?
* 4. Print kya ho raha hai? (*, i, j, letters?)

* Outer loop = rows
* Inner loop = design (stars/numbers)

* Square |
j <= n

* Increasing triangle |
j <= i

* Decreasing triangle |
j <= n - i + 1

* Right aligned triangle |
spaces = n - i
stars = i

* Pyramid |
spaces = n - i
stars = 2 * i - 1

* Inverted pyramid |
spaces = i - 1
stars = 2 * (n - i) + 1

* Diamond |
pyramid + inverted pyramid

* Hollow |
if border => "*"
else => " "

### Fibonacci

* Next = sum of previous two numbers
* - Start with 0, 1
* - next = a + b
* - shift values
* - O(n)

### Prime

* Not divisible by anything except 1 and itself
* i <= Math.sqrt(n)

### Factorial

* Multiply from 1 to n

## Basic Complete

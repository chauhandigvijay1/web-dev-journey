/*
    Question: Sum using Function

    Problem:
    Create a function that returns sum of two numbers.

    Approach:
    - Create a function sum()
    - Pass two numbers
    - Return their sum
*/

#include <bits/stdc++.h>
using namespace std;

int sum(int a, int b) {
    return a + b;
}

int main() {
    int a, b;

    cout << "Enter first number: ";
    cin >> a;

    cout << "Enter second number: ";
    cin >> b;

    cout << "The sum of given numbers is: " << sum(a, b) << endl;

    return 0;
}

/*
Sample Input:
10
20

Sample Output:
The sum of given numbers is: 30
*/
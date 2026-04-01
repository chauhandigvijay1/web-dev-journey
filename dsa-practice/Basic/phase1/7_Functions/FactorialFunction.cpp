/*
    Question: Factorial using Function

    Problem:
    Create a function to calculate factorial of a number.

    Approach:
    - Create factorial() function
    - Multiply numbers from 1 to n
    - Return factorial
*/

#include <bits/stdc++.h>
using namespace std;

long long factorial(int n) {
    long long fact = 1;

    for(int i = 1; i <= n; i++) {
        fact *= i;
    }

    return fact;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Factorial of " << n << " is: " << factorial(n) << endl;

    return 0;
}

/*
Sample Input:
5

Sample Output:
Factorial of 5 is: 120
*/
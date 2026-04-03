/*
    Question: Automorphic Number

    Problem:
    Check whether a number is an Automorphic Number or not.
    An Automorphic Number is a number whose square ends with the same number.

    Example:
    25 -> 25^2 = 625

    Approach:
    - Find square of the number
    - Compare last digits using modulo
*/

#include <bits/stdc++.h>
using namespace std;

// Function to count digits
int countDigits(int n) {
    if(n == 0) return 1;

    int count = 0;
    n = abs(n);

    while(n > 0) {
        count++;
        n = n / 10;
    }

    return count;
}

// Function to check Automorphic Number
bool isAutomorphic(int n) {
    int square = n * n;
    int digits = countDigits(n);
    int power = pow(10, digits);

    return square % power == n;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isAutomorphic(n)) {
        cout << n << " is an Automorphic Number." << endl;
    } 
    else {
        cout << n << " is NOT an Automorphic Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 25
25 is an Automorphic Number.
*/
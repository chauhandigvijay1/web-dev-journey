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


// Function to check Automorphic Number
bool isAutomorphic(int n) {
    int square = n * n;
    if(n%10 == 0) return false; // Automorphic numbers cannot end with 0
    if(n < 0) return false; // Automorphic numbers cannot be negative
    if(n == 0) return true; // 0 is an Automorphic number
    if(n%10 == (n*n)%10) return true; // Check last digit

    return false;
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
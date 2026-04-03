/*
    Question: Check Prime Number

    Problem:
    Check whether a given number is Prime or not.
    A prime number has exactly two divisors: 1 and itself.

    Approach:
    - If n <= 1, it is not prime
    - Run loop from 2 to n-1
    - If any number divides n, then it is not prime
*/

#include <bits/stdc++.h>
using namespace std;

// Function to check prime
bool isPrime(int n) {
    if(n <= 1) {
        return false;
    }

    for(int i = 2; i < n; i++) {
        if(n % i == 0) {
            return false;
        }
    }

    return true;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isPrime(n)) {
        cout << n << " is a Prime Number." << endl;
    } 
    else {
        cout << n << " is NOT a Prime Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 7
7 is a Prime Number.
*/
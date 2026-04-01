/*
    Question: Prime Check using Function

    Problem:
    Create a function that checks whether a number is prime or not.

    Approach:
    - Create isPrime() function
    - Return true if number is prime
    - Else return false
*/

#include <bits/stdc++.h>
using namespace std;

bool isPrime(int n) {
    if(n <= 1)
        return false;

    for(int i = 2; i < n; i++) {
        if(n % i == 0)
            return false;
    }

    return true;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isPrime(n))
        cout << n << " is a Prime Number" << endl;
    else
        cout << n << " is NOT a Prime Number" << endl;

    return 0;
}

/*
Sample Input:
7

Sample Output:
7 is a Prime Number
*/
/*
    Question: Pattern 20 - Symmetric Butterfly Pattern

    Problem:
    Print a symmetric butterfly pattern.

    Example for n = 5:
    *        *
    **      **
    ***    ***
    ****  ****
    **********
    ****  ****
    ***    ***
    **      **
    *        *

    Approach:
    - Pattern has two halves
    - Upper half: stars increase, spaces decrease
    - Lower half: stars decrease, spaces increase
*/

#include <bits/stdc++.h>
using namespace std;

void SymmetricButterflyPattern(int n) {
    // Upper half
    for(int i=1; i<=n; i++) {
        // Print stars on left
        for(int j=1; j<=i; j++) {
            cout << "*";
        }
        // Print spaces in middle
        for(int j=1; j<=2*(n-i); j++) {
            cout << " ";
        }
        // Print stars on right
        for(int j=1; j<=i; j++) {
            cout << "*";
        }
        cout << endl;
    }

    // Lower half
    for(int i=n-1; i>=1; i--) {
        // Print stars on left
        for(int j=1; j<=i; j++) {
            cout << "*";
        }
        // Print spaces in middle
        for(int j=1; j<=2*(n-i); j++) {
            cout << " ";
        }
        // Print stars on right
        for(int j=1; j<=i; j++) {
            cout << "*";
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    SymmetricButterflyPattern(n);
    return 0;
}
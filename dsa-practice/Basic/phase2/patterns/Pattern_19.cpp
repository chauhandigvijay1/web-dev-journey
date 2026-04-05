/*
    Question: Pattern 19 - Symmetric Void Star Pattern

    Problem:
    Print a symmetric void star pattern.

    Example for n = 5:
    **********
    ****  ****
    ***    ***
    **      **
    *        *
    *        *
    **      **
    ***    ***
    ****  ****
    **********

    Approach:
    - Pattern has two halves
    - Upper half: stars decrease, spaces increase
    - Lower half: stars increase, spaces decrease
*/

#include <bits/stdc++.h>
using namespace std;

void SymmetricVoidStarPattern(int n) {
    // Upper half
    for(int i=0; i<n; i++) {
        // Print stars on left
        for(int j=0; j<n-i; j++) {
            cout << "*";
        }
        // Print spaces in middle
        for(int j=0; j<2*i; j++) {
            cout << " ";
        }
        // Print stars on right
        for(int j=0; j<n-i; j++) {
            cout << "*";
        }
        cout << endl;
    }

    // Lower half
    for(int i=n-1; i>=0; i--) {
        // Print stars on left
        for(int j=0; j<n-i; j++) {
            cout << "*";
        }
        // Print spaces in middle
        for(int j=0; j<2*i; j++) {
            cout << " ";
        }
        // Print stars on right
        for(int j=0; j<n-i; j++) {
            cout << "*";
        }
        cout << endl;
    }
}

int main() {
    
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    SymmetricVoidStarPattern(n);

    return 0;
}
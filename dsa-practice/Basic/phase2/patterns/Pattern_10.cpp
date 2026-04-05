/*
    Question: Pattern 10 - Half Diamond Star Pattern

    Problem:
    Print a half diamond star pattern.

    Example for n = 5:
    *
    **
    ***
    ****
    *****
    ****
    ***
    **
    *

    Approach:
    - First print increasing triangle
    - Then print decreasing triangle
*/

#include <bits/stdc++.h>
using namespace std;

// Function to print half diamond pattern
void HalfDiamondPattern(int n) {
    // Print upper half (increasing triangle)
    for(int i=1; i<=n; i++) {
        for(int j=1; j<=i; j++) {
            cout << "*";
        }
        cout << endl;
    }

    // Print lower half (decreasing triangle)
    for(int i=n-1; i>=1; i--) {
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
    HalfDiamondPattern(n);
    return 0;
}
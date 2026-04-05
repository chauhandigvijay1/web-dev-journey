/*
    Question: Pattern 12 - Number Crown Pattern

    Problem:
    Print a number crown pattern.

    Example for n = 4:
    1      1
    12    21
    123  321
    12344321

    Approach:
    - Print increasing numbers on left
    - Print spaces in middle
    - Print decreasing numbers on right
*/

#include <bits/stdc++.h>
using namespace std;

void NumberCrownPattern(int n) {
    for(int i=1; i<=n; i++) {
        // Print increasing numbers on left
        for(int j=1; j<=i; j++) {
            cout << j;
        }
        // Print spaces in middle
        for(int j=1; j<=2*(n-i); j++) {
            cout << " ";
        }
        // Print decreasing numbers on right
        for(int j=i; j>=1; j--) {
            cout << j;
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    NumberCrownPattern(n);
    return 0;
}
/*
    Question: Pattern 7 - Pyramid Star Pattern

    Problem:
    Print a centered pyramid star pattern.

    Example for n = 5:
        *
       ***
      *****
     *******
    *********

    Approach:
    - First print spaces
    - Then print stars
    - Spaces = n - i
    - Stars = 2*i - 1
*/

#include <bits/stdc++.h>
using namespace std;

void PyramidStarPattern(int n) {
    for(int i=1; i<=n; i++)
    {
        // Print spaces
        for(int j=1; j<=n-i; j++) {
            cout << " ";
        }
        // Print stars
        for(int j=1; j<=2*i-1; j++) {
            cout << "*";
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    PyramidStarPattern(n);
    return 0;
}
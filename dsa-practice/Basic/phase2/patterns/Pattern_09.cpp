/*
    Question: Pattern 9 - Diamond Star Pattern

    Problem:
    Print a diamond star pattern.

    Example for n = 5:
        *
       ***
      *****
     *******
    *********
     *******
      *****
       ***
        *

    Approach:
    - First print normal pyramid
    - Then print inverted pyramid
*/

#include <bits/stdc++.h>
using namespace std;

void DiamondStarPattern(int n) {
    // Print upper half (pyramid)
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

        if(n==n){
    // Print lower half (inverted pyramid)
    for(int i=n-1; i>=1; i--)
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
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    DiamondStarPattern(n);
    return 0;
}
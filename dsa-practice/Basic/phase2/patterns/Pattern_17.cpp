/*
    Question: Pattern 17 - Alpha Hill Pattern

    Problem:
    Print an alphabet hill pattern.

    Example for n = 4:
       A
      ABA
     ABCBA
    ABCDCBA

    Approach:
    - First print spaces
    - Then print increasing letters
    - Then print decreasing letters
*/

#include <bits/stdc++.h>
using namespace std;

void AlphaHillPattern(int n) {
    for(int i=1; i<=n; i++) {
        // Print spaces
        for(int j=1; j<=n-i; j++) {
            cout << " ";
        }
        // Print increasing letters
        for(int j=1; j<=i; j++) {
            cout << char('A' + j - 1);
        }
        // Print decreasing letters
        for(int j=i-1; j>=1; j--) {
            cout << char('A' + j - 1);
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    AlphaHillPattern(n);
    return 0;
}
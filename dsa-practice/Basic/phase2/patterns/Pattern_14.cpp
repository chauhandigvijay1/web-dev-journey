/*
    Question: Pattern 14 - Increasing Letter Triangle

    Problem:
    Print letters from A to current row letter.

    Example for n = 5:
    A
    AB
    ABC
    ABCD
    ABCDE

    Approach:
    - Outer loop controls rows
    - Inner loop prints letters from A onward
*/

#include <bits/stdc++.h>
using namespace std;

void IncreasingLetterTriangle(int n) {
    for(int i=1; i<=n; i++) {
        for(int j=1; j<=i; j++) {
            cout << char('A' + j - 1); // Print letter based on column number
        }
        cout << endl; // Move to next line after each row
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    IncreasingLetterTriangle(n);
    return 0;
}
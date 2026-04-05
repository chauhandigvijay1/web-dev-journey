/*
    Question: Pattern 15 - Reverse Letter Triangle

    Problem:
    Print letters in decreasing triangle form.

    Example for n = 5:
    ABCDE
    ABCD
    ABC
    AB
    A

    Approach:
    - Outer loop controls rows
    - Inner loop prints letters from A to decreasing limit
*/

#include <bits/stdc++.h>
using namespace std;

void ReverseLetterTriangle(int n) {
    for(int i=n; i>=1; i--) {
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
    ReverseLetterTriangle(n);
    return 0;
}
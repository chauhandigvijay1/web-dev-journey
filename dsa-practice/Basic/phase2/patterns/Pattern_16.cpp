/*
    Question: Pattern 16 - Repeated Letter Triangle

    Problem:
    Print same letter repeated row number times.

    Example for n = 5:
    A
    BB
    CCC
    DDDD
    EEEEE

    Approach:
    - Outer loop controls rows
    - Inner loop prints same letter i times
*/

#include <bits/stdc++.h>
using namespace std;

void RepeatedLetterTriangle(int n) {
    for(int i=1; i<=n; i++) {
        for(int j=1; j<=i; j++) {
            cout << char('A' + i - 1); // Print same letter based on row number
        }
        cout << endl; // Move to next line after each row
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    RepeatedLetterTriangle(n);
    return 0;
}
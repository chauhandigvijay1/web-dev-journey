/*
    Question: Pattern 3 - Right Triangle Number Pattern

    Problem:
    Print numbers from 1 to row number in each row.

    Example for n = 5:
    1
    12
    123
    1234
    12345

    Approach:
    - Outer loop controls rows
    - Inner loop runs from 1 to current row
    - Print j
*/

#include <bits/stdc++.h>
using namespace std;

void RightTriangleNumberPattern(int n) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << j;
        }
        cout << endl;
    }
}
int main() {
    cout << "Enter the number of rows: ";
    int n;
    cin >> n;
    RightTriangleNumberPattern(n);
    return 0;
}
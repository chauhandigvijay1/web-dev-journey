/*
    Question: Pattern 2 - Right Triangle Star Pattern

    Problem:
    Print a right triangle star pattern.

    Example for n = 5:
    *
    **
    ***
    ****
    *****

    Approach:
    - Outer loop controls rows
    - Inner loop runs from 1 to current row
    - Print '*' in each iteration
*/


#include <bits/stdc++.h>
using namespace std;

void RightTriangleStar(int n) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << "\n";
    }
}

int main() {
    cout << "Enter the number of rows: ";
    int n;
    cin >> n;
    RightTriangleStar(n);
    return 0;
}
/*
    Question: Pattern 4 - Repeated Number Triangle

    Problem:
    Print row number repeated row number times.

    Example for n = 5:
    1
    22
    333
    4444
    55555

    Approach:
    - Outer loop controls rows
    - Inner loop runs from 1 to current row
    - Print row number i
*/

#include <bits/stdc++.h>
using namespace std;

void rowNumberTriangle(int n) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << i;
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    rowNumberTriangle(n);
    return 0;
}
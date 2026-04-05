/*
    Question: Pattern 11 - Binary Number Triangle

    Problem:
    Print a binary number triangle pattern.

    Example for n = 5:
    1
    01
    101
    0101
    10101

    Approach:
    - Use row and column sum to decide what to print
    - If (i + j) is even -> print 1
    - Else -> print 0
*/

#include <bits/stdc++.h>
using namespace std;

void BinaryNumberTriangle(int n) {
    for(int i=1; i<=n; i++) {
        for(int j=1; j<=i; j++) {
            if((i + j) % 2 == 0) {
                cout << "1";
            } else {
                cout << "0";
            }
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    BinaryNumberTriangle(n);
    return 0;
}
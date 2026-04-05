/*
    Question: Pattern 5 - Inverted Right Triangle Star Pattern

    Problem:
    Print an inverted right triangle star pattern.

    Example for n = 5:
    *****
    ****
    ***
    **
    *

    Approach:
    - Outer loop controls rows
    - Inner loop runs from 1 to (n - i + 1)
    - Print '*'
*/

#include <bits/stdc++.h>
using namespace std;

void InvertedRightTriangleStarPattern(int n) {
    for(int i=n; i>0;i--){
        for(int j = i; j>0; j--){
            cout << "*";
        }        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    InvertedRightTriangleStarPattern(n);
    
    return 0;
}
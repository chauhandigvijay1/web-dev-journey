/*
    Question: Pattern 6 - Inverted Number Triangle

    Problem:
    Print numbers from 1 to decreasing count in each row.

    Example for n = 5:
    12345
    1234
    123
    12
    1

    Approach:
    - Outer loop controls rows
    - Inner loop runs from 1 to (n - i + 1)
    - Print j
*/

#include <bits/stdc++.h>
using namespace std;

void InvertedNumberTriangle(int n) {
    for(int i=1; i<=n;i++){
        for(int j = 1; j<=(n-i+1); j++){
            cout << j;
        }        cout << endl;
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    InvertedNumberTriangle(n);
    
    return 0;
}
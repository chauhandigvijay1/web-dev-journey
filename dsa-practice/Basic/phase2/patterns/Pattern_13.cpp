/*
    Question: Pattern 13 - Increasing Number Triangle

    Problem:
    Print increasing continuous numbers in triangle form.

    Example for n = 5:
    1
    2 3
    4 5 6
    7 8 9 10
    11 12 13 14 15

    Approach:
    - Use a variable num starting from 1
    - Print and increase it continuously
*/

#include <bits/stdc++.h>
using namespace std;

void IncreasingNumberTriangle(int n) {
    int num = 1; // Start from 1
    for(int i=1; i<=n; i++) {
        for(int j=1; j<=i; j++) {
            cout << num << " "; // Print current number
            num++; // Increase number for next print
        }
        cout << endl; // Move to next line after each row
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    IncreasingNumberTriangle(n);
    return 0;
}
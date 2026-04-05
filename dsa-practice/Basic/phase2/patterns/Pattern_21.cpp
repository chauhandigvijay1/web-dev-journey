/*
    Question: Pattern 21 - Hollow Rectangle Pattern

    Problem:
    Print a hollow square / rectangle pattern.

    Example for n = 4:
    ****
    *  *
    *  *
    ****

    Approach:
    - Print '*' on border
    - Print space inside
*/

#include <bits/stdc++.h>
using namespace std;

void HollowRectanglePattern(int n) {
    for(int i=1; i<=n; i++) {       
        for(int j=1; j<=n; j++) {
            if(i == 1 || i == n || j == 1 || j == n) {
                cout << "*"; // Print '*' on border
            } else {
                cout << " "; // Print space inside
            }
        }
        cout << endl; // Move to next line after each row
    }
}

int main() {

    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    HollowRectanglePattern(n);
    
    return 0;
}
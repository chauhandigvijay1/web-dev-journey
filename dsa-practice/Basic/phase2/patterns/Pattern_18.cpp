/*
    Question: Pattern 18 - Alpha Triangle Pattern

    Problem:
    Print an alphabet triangle pattern.

    Example for n = 5:
    E
    DE
    CDE
    BCDE
    ABCDE

    Approach:
    - Start character changes every row
    - Print letters from that character to last
*/

#include <bits/stdc++.h>
using namespace std;

void AlphaTrianglePattern(int n) {
    for(int i=n; i>=1; i--) {
        for(int j=i; j<=n; j++) {
            cout << char('A' + j - 1); // Print letter based on column number
        }
        cout << endl; // Move to next line after each row
    }
}

int main() {
    int n;
    cout << "Enter the number of rows: ";
    cin >> n;
    AlphaTrianglePattern(n);
    return 0;
}
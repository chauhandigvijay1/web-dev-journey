/*
    Question: Pattern 22 - Number Pattern / Concentric Rectangle Pattern

    Problem:
    Print a concentric number pattern.

    Example for n = 4:
    4 4 4 4 4 4 4
    4 3 3 3 3 3 4
    4 3 2 2 2 3 4
    4 3 2 1 2 3 4
    4 3 2 2 2 3 4
    4 3 3 3 3 3 4
    4 4 4 4 4 4 4

    Approach:
    - Pattern size is (2*n - 1)
    - For every cell, find minimum distance from all four sides
    - Value = n - minimum distance
*/

#include <bits/stdc++.h>
using namespace std;

// Function to print number pattern
void printPattern(int n) {
    int size = 2 * n - 1;

    for(int i = 0; i < size; i++) {
        for(int j = 0; j < size; j++) {
            int top = i;
            int left = j;
            int bottom = size - 1 - i;
            int right = size - 1 - j;

            int minDistance = min(min(top, bottom), min(left, right));

            cout << n - minDistance << " ";
        }
        cout << endl;
    }
}

int main() {
    int n;

    cout << "Enter number: ";
    cin >> n;

    printPattern(n);

    return 0;
}

/*
Sample Output:
Enter number: 4
4 4 4 4 4 4 4
4 3 3 3 3 3 4
4 3 2 2 2 3 4
4 3 2 1 2 3 4
4 3 2 2 2 3 4
4 3 3 3 3 3 4
4 4 4 4 4 4 4
*/
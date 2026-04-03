/*
    Question: Search Element in Matrix

    Problem:
    Find whether an element exists in matrix and print its position.

    Approach:
    - Input matrix
    - Compare each element with target
    - If found, print row and column
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int matrix[100][100], rows, cols, target;
    cout << "Enter number of rows and columns: ";
    cin >> rows >> cols;
    cout << "Enter the matrix elements:\n";
    for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            cin >> matrix[i][j];
        }
    }
    cout << "Enter element to search: ";
    cin >> target;
     for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            if(matrix[i][j] == target) {
                cout << "Element found at position: (" << i << ", " << j << ")\n";
                return 0; // Exit after finding the element
            }
        }

    cout << "Element not found in the matrix." << endl;
    return 0;
}
}
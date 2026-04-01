/*
    Question: Transpose Matrix

    Problem:
    Convert rows into columns and columns into rows.

    Approach:
    - Input matrix
    - Print arr[j][i] instead of arr[i][j]
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[100][100], rows, cols;

    cout << "Enter number of rows: ";
    cin >> rows;

    cout << "Enter number of columns: ";
    cin >> cols;

    cout << "Enter " << rows * cols << " numbers:" << endl;

    for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            cout << "Element at (" << i << "," << j << "): ";
            cin >> arr[i][j];
        }
    }

    cout << "Original Matrix:" << endl;
    for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            cout << arr[i][j] << " ";
        }
        cout << endl;
    }

    cout << "Transpose Matrix:" << endl;
    for(int j = 0; j < cols; j++) {
        for(int i = 0; i < rows; i++) {
            cout << arr[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}

/*
Sample Input:
2
3
1 2 3
4 5 6

Sample Output:
Original Matrix:
1 2 3
4 5 6

Transpose Matrix:
1 4
2 5
3 6
*/
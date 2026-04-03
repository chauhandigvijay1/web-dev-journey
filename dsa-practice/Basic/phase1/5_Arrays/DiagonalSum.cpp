/*
    Question: Diagonal Sum

    Problem:
    Find primary diagonal sum and secondary diagonal sum.

    Approach:
    - For primary diagonal: i == j
    - For secondary diagonal: i + j == cols - 1
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[100][100], rows, cols;

    cout << "Enter number of rows: ";
    cin >> rows;

    cout << "Enter number of columns: ";
    cin >> cols;

    if(rows != cols) {
        cout << "Diagonal sums can only be calculated for a square matrix." << endl;
        return 0;
    }

    cout << "Enter " << rows * cols << " numbers:" << endl;

    for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            cout << "Element at (" << i << "," << j << "): ";
            cin >> arr[i][j];
        }
    }

    int primaryDiagonalSum = 0;
    int secondaryDiagonalSum = 0;

    for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            if(i == j) {
                primaryDiagonalSum += arr[i][j];
            }
            if(i + j == cols - 1) {
                secondaryDiagonalSum += arr[i][j];
            }
        }
    }

    cout << "Primary diagonal sum: " << primaryDiagonalSum << endl;
    cout << "Secondary diagonal sum: " << secondaryDiagonalSum << endl;

    return 0;
}

/*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
Sample Input:
3
3
1 2 3
4 5 6
7 8 9

Sample Output:
Primary diagonal sum: 15
Secondary diagonal sum: 15
*/
/*
Question:
- Create and print 2D vector

Approach / Logic:
- Take rows and columns
- Create 2D vector
- Input using nested loops
- Print using nested loops

Time Complexity: O(n * m)
Space Complexity: O(n * m)

Pattern:
- Matrix / 2D Vector

Mistake / Note:
- Use vector<vector<int>>
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int rows, cols;

    cout << "Enter rows and columns: ";
    cin >> rows >> cols;

    vector<vector<int>> matrix(rows, vector<int>(cols));

    cout << "Enter elements: ";
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            cin >> matrix[i][j];
        }
    }

    cout << "Matrix:\n";
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}

/* Sample Input:
2 3
1 2 3
4 5 6

Sample Output:
Matrix:
1 2 3
4 5 6
*/
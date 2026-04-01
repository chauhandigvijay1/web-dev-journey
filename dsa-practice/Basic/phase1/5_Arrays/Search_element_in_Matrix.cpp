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
    int arr[100][100], rows, cols, target;
    bool found = false;

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

    cout << "Enter element to search: ";
    cin >> target;

    for(int i = 0; i < rows; i++) {
        for(int j = 0; j < cols; j++) {
            if(arr[i][j] == target) {
                cout << "Element found at position (" << i << "," << j << ")" << endl;
                found = true;
                break;
            }
        }
        if(found) {
            break;
        }
    }

    if(!found) {
        cout << "Element not found in the matrix." << endl;
    }

    return 0;
}

/*
Sample Input:
2
3
1 2 3
4 5 6
5

Sample Output:
Element found at position (1,1)
*/
/*
    Question: Row Sum + Column Sum

    Problem:
    Find sum of each row and each column.

    Approach:
    - Use nested loops
    - Row sum: row-wise traversal
    - Column sum: column-wise traversal
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[100][100], rows, cols;
    cout << "Enter number of rows: ";
    cin>>rows;
    cout<<"Enter number of columns:";
    cin>>cols;
    cout<<"Enter"<<rows*cols<<"Numbers:";
    for(int i=0; i<rows; i++)
    {
        for(int j=0; j<cols; j++)
        {
            cout<<"Element at ("<<i<<","<<j<<"): ";
            cin>>arr[i][j];
        }
    }
    // Calculate row sums
    cout << "Row sums:" << endl;
    for(int i=0; i<rows; i++)
    {
        int sum = 0;
        for(int j=0; j<cols; j++)
        {
            sum += arr[i][j];
        }
        cout << "Sum of row " << i << ": " << sum << endl;
    }
    // Calculate column sums
    cout << "Column sums:" << endl;
    for(int j=0; j<cols; j++)
    {
        int sum = 0;
        for(int i=0; i<rows; i++)
        {
            sum += arr[i][j];
        }
        cout << "Sum of column " << j << ": " << sum << endl;
    }

    return 0;
}
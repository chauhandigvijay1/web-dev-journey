/*
    Question: Input + Print Matrix

    Problem:
    Take rows and columns, input matrix, and print it.

    Approach:
    - Input rows and columns
    - Use nested loops for input and output
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[100][100], rows, cols;
    cout << "Enter number of rows: ";
    cin >> rows;
    cout << "Enter number of columns: ";   
    cin>>cols;
    cout<<"Enter " << rows*cols << " numbers: ";
    for(int i=0; i<rows; i++)
    {
        for(int j=0; j<cols; j++)
        {
            cout<<"Element at ("<<i<<","<<j<<"): ";
            cin>>arr[i][j];
        }
    }
    cout<<"Matrix:";
    for(int i=0; i<rows; i++)
    {
        cout<<endl;
        for(int j=0; j<cols; j++)
        {
            cout<<arr[i][j]<<" ";
        }
    }
    return 0;
}

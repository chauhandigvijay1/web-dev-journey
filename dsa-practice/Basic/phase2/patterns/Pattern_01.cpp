/*
    Question: Pattern 1 - Square Star Pattern

    Problem:
    Print a square pattern of stars of size n.

    Example for n = 5:
    *****
    *****
    *****
    *****
    *****

    Approach:
    - Run outer loop for rows
    - Run inner loop for columns
    - Print '*' in each position
*/

#include<bits/stdc++.h>
using namespace std;


void SquareStar(int n){
    for(int i=1; i<=n;i++)
    {
        for(int j= 1; j<=n; j++)
        {
            cout<<"*";
        }
        cout<<"\n";
    }
}

int main()
{
    cout<<"Enter the no. of rows: ";
    int n;
    cin>>n;

    SquareStar(n);
    return 0;
}
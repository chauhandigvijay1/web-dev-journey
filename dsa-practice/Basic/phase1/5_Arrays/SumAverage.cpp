/*
    Question: Sum + Average of Array

    Problem:
    Find total sum and average of array elements.

    Approach:
    - Input array
    - Add all elements
    - Divide sum by number of elements
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[5];
    int sum=0;
    cout << "Enter 5 numbers: ";
    for(int i=0; i<=4;i++)
    {
        cin>>arr[i];
    }
    for(int i=0;i<=4;i++)
    {
        sum= sum + arr[i];
    }
    cout<<"Sum of the numbers is: "<<sum<<endl;
    cout<<"Average of the numbers is: "<<(float)sum/5.0<<endl;
    return 0;
}
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
    int arr[100];
    int sum=0, n;
    cout << "Enter no. of elements: ";
    cin >> n;
    cout << "Enter " << n << " numbers: ";
    for(int i=0; i<n;i++)
    {
        cin>>arr[i];
    }
    for(int i=0;i<n;i++)
    {
        sum= sum + arr[i];
    }
    cout<<"Sum of the numbers is: "<<sum<<endl;
    cout<<"Average of the numbers is: "<<(float)sum/n<<endl;
    return 0;
}
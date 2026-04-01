/*
    Question: Linear Search

    Problem:
    Search for an element in array and print its index.

    Approach:
    - Input array
    - Compare each element with target
    - If found, print index
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int a[100], n ,target;
    cout << "Enter number of elements: ";
    cin >> n;
    cout << "Enter " << n << " numbers: ";
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    cout<<"Enter element to search: ";
    cin>>target;
    for(int i=0;i<n;i++)
    {
        if(a[i] == target)
        {
            cout<<"Element found at index: "<<i<<endl;
            break;
        }
    }
    return 0;
}
/*
    Question: Count Frequency of an Element

    Problem:
    Count how many times a given element appears in array.

    Approach:
    - Input array
    - Compare each element with target
    - Increase count if matched
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int a[100], n ,target, count=0;
    cout << "Enter number of elements: ";
    cin >> n;
    cout << "Enter " << n << " numbers: ";
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    cout<<"Enter element to count frequency: ";
    cin>>target;
    for(int i=0;i<n;i++)
    {
        if(a[i] == target)
        {
            count = count + 1;
        }
    }
    cout << "Frequency of " << target << " is: " << count << endl;

    return 0;
}
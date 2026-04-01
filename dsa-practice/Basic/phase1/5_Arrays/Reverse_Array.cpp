/*
    Question: Reverse Array

    Problem:
    Print array in reverse order.

    Approach:
    - Input array
    - Print from last index to first
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter number of elements: ";
    cin >> n;

    int arr[n];

    cout << "Enter " << n << " numbers: ";
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    cout << "Reversed Array: ";
    for(int i = n - 1; i >= 0; i--) {
        cout << arr[i] << " ";
    }

    return 0;
}

/*
Sample Input:
5
1 2 3 4 5

Sample Output:
Reversed Array: 5 4 3 2 1
*/
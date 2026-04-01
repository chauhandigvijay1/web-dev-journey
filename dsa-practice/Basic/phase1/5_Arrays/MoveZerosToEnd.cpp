/*
    Question: Move Zeros to End

    Problem:
    Move all zero elements to the end of array.

    Approach:
    - Store all non-zero elements first
    - Fill remaining positions with 0
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[100], n, count = 0;
    cout << "Enter number of elements: ";  
    cin >> n;
    cout << "Enter " << n << " numbers: ";
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    // Move non-zero elements to the front
    for (int i = 0; i < n; i++)
    {
        if (arr[i] != 0) {
            arr[count++] = arr[i];
        }
    }
    // Fill remaining positions with 0
    while (count < n) {
        arr[count++] = 0;
    }
    // Print the modified array
    cout << "Array after moving zeros to end: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    return 0;
}
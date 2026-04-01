/*
    Question: Max + Min in Array

    Problem:
    Find largest and smallest element in array.

    Approach:
    - Assume first element as max and min
    - Compare all elements
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int arr[5];
    cout << "Enter 5 numbers: ";
    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }
    int max=arr[0];
    int min=arr[0];
    for (int i = 0; i < 5; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    cout << "Maximum number is: " << max << endl;
    cout << "Minimum number is: " << min << endl;


    return 0;
}
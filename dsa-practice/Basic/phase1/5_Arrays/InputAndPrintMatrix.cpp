/*
    Question: Input + Print Array

    Problem:
    Take array input and display all elements.

    Approach:
    - Read size of array
    - Input all elements
    - Print all elements
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int arr[n];

    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    cout << "Array Elements: ";
    for(int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }

    return 0;
}

/*
Sample Input:
5
1 2 3 4 5

Sample Output:
Array Elements: 1 2 3 4 5
*/
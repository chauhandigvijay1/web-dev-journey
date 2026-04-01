/*
    Question: Array Sum using Function

    Problem:
    Pass array to a function and calculate sum.

    Approach:
    - Create arraySum() function
    - Pass array and size
    - Return total sum
*/

#include <bits/stdc++.h>
using namespace std;

int arraySum(int arr[], int size) {
    int sum = 0;

    for(int i = 0; i < size; i++) {
        sum += arr[i];
    }

    return sum;
}

int main() {
    int arr[100], n;

    cout << "Enter size of array: ";
    cin >> n;

    cout << "Enter " << n << " elements:" << endl;

    for(int i = 0; i < n; i++) {
        cout << "Element at index " << i << ": ";
        cin >> arr[i];
    }

    cout << "Sum of array elements is: " << arraySum(arr, n) << endl;

    return 0;
}

/*
Sample Input:
5
1 2 3 4 5

Sample Output:
Sum of array elements is: 15
*/
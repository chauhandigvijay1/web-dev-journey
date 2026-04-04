/*
    Question: Check Prime number in array

    Problem:
    Create a function to check if a number is prime.

    Approach:
    - Create isPrime() function
    - Check divisibility up to square root of the number
    - Return true or false
*/

#include <bits/stdc++.h>
using namespace std;

bool isPrime(int num) {
    if (num <= 1) {
        return false;
    }

    for (int j = 2; j <= sqrt(num); j++) {
        if (num % j == 0) {
            return false;
        }
    }

    return true;
}

int main() {
    int size;

    cout << "Enter size of array: ";
    cin >> size;

    int arr[size];

    cout << "Enter elements of array: ";
    for (int i = 0; i < size; i++) {
        cin >> arr[i];
    }

    bool found = false;

    cout << "Prime numbers in the array are: ";
    for (int i = 0; i < size; i++) {
        if (isPrime(arr[i])) {
            cout << arr[i] << " ";
            found = true;
        }
    }

    if (!found) {
        cout << "No prime numbers in the array.";
    }

    return 0;
}
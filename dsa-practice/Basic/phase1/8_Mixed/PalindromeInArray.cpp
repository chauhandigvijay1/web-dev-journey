/*
    Question: Count Palindrome Numbers in Array

    Problem:
    Input array and count how many elements are palindrome numbers.

    Approach:
    - Create a function isPalindrome()
    - Traverse array
    - Count palindrome numbers
*/

#include <bits/stdc++.h>
using namespace std;

bool isPalindrome(int n) {
    int original = n, rev = 0;

    while(n > 0) {
        int digit = n % 10;
        rev = rev * 10 + digit;
        n = n / 10;
    }

    return original == rev;
}

int main() {
    int arr[100], n, count = 0;

    cout << "Enter size of array: ";
    cin >> n;

    cout << "Enter " << n << " elements:" << endl;
    for(int i = 0; i < n; i++) {
        cout << "Element at index " << i << ": ";
        cin >> arr[i];
    }

    for(int i = 0; i < n; i++) {
        if(isPalindrome(arr[i])) {
            count++;
        }
    }

    cout << "Total palindrome numbers in the array are: " << count << endl;

    return 0;
}

/*
Sample Input:
4
121 123 44 56

Sample Output:
Total palindrome numbers in the array are: 2
*/
/*
    Question: Palindrome Number

    Problem:
    Check whether a number is palindrome or not.
    A palindrome number remains same after reversing.

    Approach:
    - Reverse the number
    - Compare reversed number with original number
*/

#include <bits/stdc++.h>
using namespace std;

// Function to reverse number
int reverseNumber(int n) {
    int rev = 0, temp = abs(n);

    while(temp > 0) {
        int digit = temp % 10;
        rev = rev * 10 + digit;
        temp = temp / 10;
    }

    return rev;
}

// Function to check palindrome
bool isPalindrome(int n) {
    if(n < 0) return false;
    return n == reverseNumber(n);
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isPalindrome(n)) {
        cout << n << " is a Palindrome Number." << endl;
    } 
    else {
        cout << n << " is NOT a Palindrome Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 121
121 is a Palindrome Number.
*/
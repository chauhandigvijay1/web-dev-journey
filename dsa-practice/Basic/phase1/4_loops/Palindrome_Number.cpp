/*
    Question: Palindrome Number

    Problem:
    Check whether a number is palindrome.

    Approach:
    - Reverse the number
    - Compare original and reversed number
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, original, rev = 0;
    cout<<"Enter number:";
    cin >> n;

    original = n;

    while(n > 0) {
        int digit = n % 10;
        rev = rev * 10 + digit;
        n = n / 10;
    }

    if(original == rev)
        cout << "Palindrome";
    else
        cout << "Not Palindrome";

    return 0;
}

/*
Sample Input:
121

Sample Output:
Palindrome
*/
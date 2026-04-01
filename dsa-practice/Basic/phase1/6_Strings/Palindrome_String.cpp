/*
    Question: Palindrome String

    Problem:
    Check whether a string is palindrome.

    Approach:
    - Compare characters from start and end
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string str;

    cout << "Enter a string: ";
    getline(cin, str);

    int n = str.length();
    bool isPalindrome = true;

    for(int i = 0; i < n / 2; i++) {
        if(str[i] != str[n - 1 - i]) {
            isPalindrome = false;
            break;
        }
    }

    if(isPalindrome)
        cout << "The string is a Palindrome" << endl;
    else
        cout << "The string is NOT a Palindrome" << endl;

    return 0;
}
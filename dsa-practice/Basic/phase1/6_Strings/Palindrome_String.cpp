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

    string rev = "";
    for(int i = str.length() - 1; i >= 0; i--) {
        rev = rev + str[i];
    }

    if(str == rev)
        cout << "The string is a Palindrome" << endl;
    else
        cout << "The string is NOT a Palindrome" << endl;


    return 0;
}
/*
    Question: String Palindrome using Function

    Problem:
    Create a function to check whether a string is palindrome.

    Approach:
    - Create isPalindrome() function
    - Compare characters from start and end
    - Return true or false
*/

#include <bits/stdc++.h>
using namespace std;

bool isPalindrome(string str) {
    string original = str;
    string rev = "";
    for(int i = str.length() - 1; i >= 0; i--) {
        rev += str[i];
    }
    if(rev == original) {
        return true;
    } else {
        return false;
    }
}

int main() {
    string str;

    cout << "Enter a string: ";
    getline(cin, str);

    if(isPalindrome(str))
        cout << "The string is a Palindrome" << endl;
    else
        cout << "The string is NOT a Palindrome" << endl;

    return 0;
}

/*
Sample Input:
madam

Sample Output:
The string is a Palindrome
*/
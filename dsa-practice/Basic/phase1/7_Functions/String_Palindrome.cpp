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
    int n = str.length();

    for(int i = 0; i < n / 2; i++) {
        if(str[i] != str[n - 1 - i])
            return false;
    }

    return true;
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
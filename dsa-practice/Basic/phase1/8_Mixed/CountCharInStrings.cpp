/*
    Question: Count Characters in String

    Problem:
    Count:
    - Uppercase letters
    - Lowercase letters
    - Digits
    - Special characters

    Approach:
    - Traverse string
    - Check character type
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string str;
    int upper = 0, lower = 0, digit = 0, special = 0;

    cout << "Enter a string: ";
    getline(cin, str);

    for(int i = 0; i < str.length(); i++) {
        if(str[i] >= 'A' && str[i] <= 'Z')
            upper++;
        else if(str[i] >= 'a' && str[i] <= 'z')
            lower++;
        else if(str[i] >= '0' && str[i] <= '9')
            digit++;
        else if(str[i] != ' ')
            special++;
    }

    cout << "Number of uppercase letters: " << upper << endl;
    cout << "Number of lowercase letters: " << lower << endl;
    cout << "Number of digits: " << digit << endl;
    cout << "Number of special characters: " << special << endl;

    return 0;
}
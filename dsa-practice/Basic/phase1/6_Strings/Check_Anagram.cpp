/*
    Question: Check Anagram

    Problem:
    Check whether two strings are anagrams.
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string str1, str2;

    cout << "Enter first string: ";
    cin >> str1;

    cout << "Enter second string: ";
    cin >> str2;

    sort(str1.begin(), str1.end());
    sort(str2.begin(), str2.end());

    if(str1 == str2)
        cout << "The strings are Anagrams" << endl;
    else
        cout << "The strings are NOT Anagrams" << endl;

    return 0;
}
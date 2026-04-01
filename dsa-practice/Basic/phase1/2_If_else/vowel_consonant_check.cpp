/*
    Question: Vowel or Consonant

    Problem:
    Check whether a character is a vowel or consonant.

    Approach:
    - Compare with a, e, i, o, u (both cases)
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    char ch;
    cout<< "Enter a character: ";
    cin >> ch;

    if(ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u'||
       ch=='A'||ch=='E'||ch=='I'||ch=='O'||ch=='U')
        cout << "Vowel";
    else
        cout << "Consonant";

    return 0;
}
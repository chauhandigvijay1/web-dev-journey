/*
    Question: Count Words

    Problem:
    Count number of words in a sentence.
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string str;

    cout << "Enter a sentence: ";
    getline(cin, str);

    int words = 0;

    for(int i = 0; i < str.length(); i++) {
        if(str[i] != ' ' && (i == 0 || str[i-1] == ' '))
            words++;
    }

    cout << "Total number of words: " << words << endl;

    return 0;
}
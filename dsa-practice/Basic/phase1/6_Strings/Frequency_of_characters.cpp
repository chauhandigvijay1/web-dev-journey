/*
    Question: Frequency of Characters

    Problem:
    Count frequency of each character.
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string str;

    cout << "Enter a string: ";
    getline(cin, str);

    int freq[256] = {0};

    for(int i = 0; i < str.length(); i++) {
        freq[str[i]]++;
    }

    cout << "Character frequencies:" << endl;

    for(int i = 0; i < 256; i++) {
        if(freq[i] > 0 && i != ' ') {
            cout << char(i) << " = " << freq[i] << endl;
        }
    }

    return 0;
}
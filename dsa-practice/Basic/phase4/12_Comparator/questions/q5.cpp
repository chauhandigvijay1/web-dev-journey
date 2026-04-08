/*
Question:
- Sort strings by length

Approach / Logic:
- Compare length of strings
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(string a, string b) {
    return a.length() < b.length();
}

int main() {
    vector<string> v = {"apple", "hi", "banana", "cat"};

    sort(v.begin(), v.end(), cmp);

    for (auto s : v)
        cout << s << " ";

    return 0;
}
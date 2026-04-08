/*
Question:
- Sort students by marks

Approach / Logic:
- Use pair<string, int>
- Sort by second (marks)
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<string,int> a, pair<string,int> b) {
    return a.second > b.second; // descending marks
}

int main() {
    vector<pair<string,int>> v = {
        {"Aman", 85},
        {"Ravi", 92},
        {"Neha", 78}
    };

    sort(v.begin(), v.end(), cmp);

    for (auto p : v)
        cout << p.first << " " << p.second << endl;

    return 0;
}
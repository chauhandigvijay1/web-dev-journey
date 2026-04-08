/*
Question:
- Sort intervals by ending time

Approach / Logic:
- Sort by second value
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<int,int> a, pair<int,int> b) {
    return a.second < b.second;
}

int main() {
    vector<pair<int,int>> v = {{1,3}, {2,4}, {0,2}};

    sort(v.begin(), v.end(), cmp);

    for (auto p : v)
        cout << p.first << " " << p.second << endl;

    return 0;
}
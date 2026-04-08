/*
Question:
- If second is same, sort by first

Approach / Logic:
- If second equal → compare first
- Else compare second
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<int,int> a, pair<int,int> b) {
    if (a.second == b.second)
        return a.first < b.first;
    return a.second < b.second;
}

int main() {
    vector<pair<int,int>> v = {{1,2}, {3,2}, {2,1}};

    sort(v.begin(), v.end(), cmp);

    for (auto p : v)
        cout << p.first << " " << p.second << endl;

    return 0;
}
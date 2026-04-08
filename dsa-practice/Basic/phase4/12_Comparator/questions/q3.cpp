/*
Question:
- Sort vector of pairs by second value

Approach / Logic:
- Compare a.second < b.second
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<int,int> a, pair<int,int> b) {
    return a.second < b.second;
}

int main() {
    vector<pair<int,int>> v = {{3,1}, {1,3}, {2,2}};

    sort(v.begin(), v.end(), cmp);

    for (auto p : v)
        cout << p.first << " " << p.second << endl;

    return 0;
}
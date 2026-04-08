/*
Question:
- Sort vector of pairs by first value

Approach / Logic:
- Default sorting already does this
- Or explicitly use comparator

Pattern:
- Pair Sorting
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<int,int> a, pair<int,int> b) {
    return a.first < b.first;
}

int main() {
    vector<pair<int,int>> v = {{3,1}, {1,2}, {2,3}};

    sort(v.begin(), v.end(), cmp);

    for (auto p : v)
        cout << p.first << " " << p.second << endl;

    return 0;
}
/*
Question:
- Sort points by x / y

Approach / Logic:
- Sort by first (x) or second (y)
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(pair<int,int> a, pair<int,int> b) {
    return a.first < b.first; // change to second for y
}

int main() {
    vector<pair<int,int>> points = {{3,4}, {1,2}, {5,1}};

    sort(points.begin(), points.end(), cmp);

    for (auto p : points)
        cout << p.first << " " << p.second << endl;

    return 0;
}
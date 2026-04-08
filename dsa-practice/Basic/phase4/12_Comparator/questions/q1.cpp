/*
Question:
- Sort vector in descending order using comparator

Approach / Logic:
- Custom comparator function
- Return a > b

Time Complexity: O(n log n)
Space Complexity: O(1)

Pattern:
- Custom Sorting

Mistake / Note:
- a > b → descending
*/

#include <bits/stdc++.h>
using namespace std;

bool cmp(int a, int b) {
    return a > b;
}

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    vector<int> v(n);
    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) cin >> v[i];

    sort(v.begin(), v.end(), cmp);

    cout << "Descending order: ";
    for (auto x : v) cout << x << " ";

    return 0;
}
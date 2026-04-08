/*
Question:
- Sort vector in descending order

Approach / Logic:
- Take vector input
- Use sort with greater<int>()
- Print sorted vector

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Sorting with Comparator

Mistake / Note:
- Use greater<int>() for descending
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    vector<int> v(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) cin >> v[i];

    sort(v.begin(), v.end(), greater<int>());

    cout << "Descending order: ";
    for (auto x : v) cout << x << " ";

    return 0;
}

/* Sample Input:
5
4 2 8 1 6

Sample Output:
Descending order: 8 6 4 2 1
*/
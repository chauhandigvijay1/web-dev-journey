/*
Question:
- Reverse vector using STL

Approach / Logic:
- Take vector input
- Use reverse()
- Print reversed vector

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Reverse

Mistake / Note:
- reverse modifies original vector
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

    reverse(v.begin(), v.end());

    cout << "Reversed vector: ";
    for (auto x : v) cout << x << " ";

    return 0;
}

/* Sample Input:
5
1 2 3 4 5

Sample Output:
Reversed vector: 5 4 3 2 1
*/
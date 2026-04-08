/*
Question:
- Count distinct elements in array

Approach / Logic:
- Insert all elements into unordered_set
- Size of set = distinct count

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Hashing / Unique Count

Mistake / Note:
- Order irrelevant
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

    unordered_set<int> s(v.begin(), v.end());

    cout << "Distinct count: " << s.size();

    return 0;
}

/* Sample Input:
6
1 2 2 3 4 3

Sample Output:
Distinct count: 4
*/
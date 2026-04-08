/*
Question:
- Detect duplicate element quickly

Approach / Logic:
- Traverse array
- If element already exists in set → duplicate found
- Else insert into set

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Hashing / Duplicate Detection

Mistake / Note:
- Check before insert
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

    unordered_set<int> s;

    for (int i = 0; i < n; i++) {
        if (s.find(v[i]) != s.end()) {
            cout << "Duplicate found: " << v[i];
            return 0;
        }
        s.insert(v[i]);
    }

    cout << "No duplicates found";

    return 0;
}

/* Sample Input:
5
1 2 3 4 2

Sample Output:
Duplicate found: 2
*/
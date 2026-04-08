/*
Question:
- Find first repeating element

Approach / Logic:
- Traverse array
- Use unordered_map to track visited elements
- First element seen again → answer

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Hashing + First Repeat

Mistake / Note:
- Check before inserting
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

    unordered_map<int, int> mp;

    for (int i = 0; i < n; i++) {
        if (mp[v[i]] > 0) {
            cout << "First repeating element: " << v[i];
            return 0;
        }
        mp[v[i]]++;
    }

    cout << "No repeating element";

    return 0;
}

/* Sample Input:
5
1 2 3 4 2

Sample Output:
First repeating element: 2
*/
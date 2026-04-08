/*
Question:
- Count frequency using unordered_map

Approach / Logic:
- Take array input
- Use unordered_map<int, int>
- Increase count for each element
- Print frequencies

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Frequency Count (Hashing)

Mistake / Note:
- mp[x]++ automatically initializes 0
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

    for (int x : v) {
        mp[x]++;
    }

    cout << "Frequencies:\n";
    for (auto it : mp) {
        cout << it.first << " -> " << it.second << endl;
    }

    return 0;
}

/* Sample Input:
6
1 2 2 3 3 3

Sample Output:
Frequencies:
1 -> 1
2 -> 2
3 -> 3
*/
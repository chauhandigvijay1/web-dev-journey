/*
Question:
- Find duplicates in array

Approach / Logic:
- Count frequency using unordered_map
- Print elements with frequency > 1

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Frequency + Filtering

Mistake / Note:
- Print each duplicate only once
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

    for (int x : v) mp[x]++;

    cout << "Duplicates: ";
    for (auto it : mp) {
        if (it.second > 1) {
            cout << it.first << " ";
        }
    }

    return 0;
}

/* Sample Input:
6
1 2 2 3 4 3

Sample Output:
Duplicates: 2 3
*/
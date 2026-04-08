/*
Question:
- Two Sum using map

Approach / Logic:
- Use map to store element and index
- For each element:
  check if (target - element) exists
- If yes → print indices

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Two Sum + Hashing

Mistake / Note:
- Check before inserting current element
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

    int target;
    cout << "Enter target: ";
    cin >> target;

    map<int, int> mp;

    for (int i = 0; i < n; i++) {
        int complement = target - v[i];

        if (mp.find(complement) != mp.end()) {
            cout << "Indices: " << mp[complement] << " " << i;
            return 0;
        }

        mp[v[i]] = i;
    }

    cout << "No pair found";

    return 0;
}

/* Sample Input:
5
2 7 11 15 3
9

Sample Output:
Indices: 0 1
*/
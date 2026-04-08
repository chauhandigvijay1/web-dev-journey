/*
Question:
- Find element with highest frequency

Approach / Logic:
- Count frequency using map
- Traverse map and track max frequency
- Print element with max frequency

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Frequency + Max

Mistake / Note:
- Track both value and frequency
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

    map<int, int> mp;

    for (int x : v) mp[x]++;

    int maxFreq = 0, element;

    for (auto it : mp) {
        if (it.second > maxFreq) {
            maxFreq = it.second;
            element = it.first;
        }
    }

    cout << "Element with highest frequency: " << element;

    return 0;
}

/* Sample Input:
6
1 2 2 3 3 3

Sample Output:
Element with highest frequency: 3
*/
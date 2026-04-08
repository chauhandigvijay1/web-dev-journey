/*
Question:
- First unique element in array

Approach / Logic:
- Count frequencies using map
- Traverse original array
- First element with freq = 1 → answer

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Frequency + Traversal

Mistake / Note:
- Traverse original array, not map
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

    for (auto val : mp) {
        if (val.second == 1) {
            cout << "First unique element: " << val.first;
            return 0;
        }
    }

    cout << "No unique element";

    return 0;
}

/* Sample Input:
6
2 3 4 2 3 5

Sample Output:
First unique element: 4
*/
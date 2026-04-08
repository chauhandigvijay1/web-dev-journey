/*
Question:
- Store and print key-value pairs

Approach / Logic:
- Use map<int, int>
- Insert key-value pairs
- Traverse map and print

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Map Basics

Mistake / Note:
- Map stores keys in sorted order
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter number of pairs: ";
    cin >> n;

    map<int, int> mp;

    cout << "Enter key value pairs:\n";
    for (int i = 0; i < n; i++) {
        int key, value;
        cin >> key >> value;
        mp[key] = value;
    }

    cout << "Map elements:\n";
    for (auto it : mp) {
        cout << it.first << " -> " << it.second << endl;
    }

    return 0;
}

/* Sample Input:
3
1 10
2 20
3 30

Sample Output:
Map elements:
1 -> 10
2 -> 20
3 -> 30
*/
/*
Question:
- Traverse map using iterator

Approach / Logic:
- Take input key-value pairs
- Store in map
- Use map<int, int>::iterator
- Loop from begin() to end()
- Access using it->first (key) and it->second (value)

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Map Traversal

Mistake / Note:
- it->first = key
- it->second = value
- (*it).first bhi likh sakte ho but -> better hai
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

    cout << "Map elements using iterator:\n";

    map<int, int>::iterator it;

    for (it = mp.begin(); it != mp.end(); it++) {
        cout << it->first << " -> " << it->second << endl;
    }

    return 0;
}

/* Sample Input:
3
1 10
2 20
3 30

Sample Output:
Map elements using iterator:
1 -> 10
2 -> 20
3 -> 30
*/
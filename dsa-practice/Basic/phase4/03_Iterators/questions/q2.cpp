/*
Question:
- Reverse print vector using iterator

Approach / Logic:
- Take vector input
- Use reverse iterator (rbegin to rend)
- Print elements using *it

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Reverse Iterator

Mistake / Note:
- Use vector<int>::reverse_iterator
- rbegin() -> last element
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;

    cout << "Enter size of vector: ";
    cin >> n;

    vector<int> v(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }

    cout << "Vector in reverse using iterator: ";

    for (auto it = v.rbegin(); it != v.rend(); it++) {
        cout << *it << " ";
    }

    return 0;
}

/* Sample Input:
5
1 2 3 4 5

Sample Output:
Vector in reverse using iterator: 5 4 3 2 1
*/
/*
Question:
- Traverse vector using iterator

Approach / Logic:
- Take vector input
- Declare iterator: vector<int>::iterator
- Loop from begin() to end()
- Print values using *it

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Iterator Traversal

Mistake / Note:
- *it se value access hoti hai
- it++ se next element
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

    cout << "Vector elements using iterator: ";

    for (auto it = v.begin(); it != v.end(); it++) {
        cout << *it << " ";
    }

    return 0;
}

/* Sample Input:
5
1 2 3 4 5

Sample Output:
Vector elements using iterator: 1 2 3 4 5
*/
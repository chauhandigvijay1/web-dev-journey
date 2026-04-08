/*
Question:
- Delete element at specific index in vector

Approach / Logic:
- Take vector input
- Take index to delete
- Use erase() function
- Print updated vector

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Vector Deletion

Mistake / Note:
- Index should be valid
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

    int index;
    cout << "Enter index to delete: ";
    cin >> index;

    v.erase(v.begin() + index);

    cout << "Vector after deletion: ";
    for (int i = 0; i < v.size(); i++) {
        cout << v[i] << " ";
    }

    return 0;
}

/* Sample Input:
5
1 2 3 4 5
2

Sample Output:
Vector after deletion: 1 2 4 5
*/
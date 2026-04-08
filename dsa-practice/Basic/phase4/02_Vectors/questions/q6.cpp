/*
Question:
- Insert element at specific index in vector

Approach / Logic:
- Take vector input
- Take index and value
- Use insert() function
- Print updated vector

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Vector Insertion

Mistake / Note:
- Index must be between 0 to n
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

    int index, value;
    cout << "Enter index: ";
    cin >> index;

    cout << "Enter value: ";
    cin >> value;

    v.insert(v.begin() + index, value);

    cout << "Vector after insertion: ";
    for (int i = 0; i < v.size(); i++) {
        cout << v[i] << " ";
    }

    return 0;
}

/* Sample Input:
5
1 2 4 5 6
2
3

Sample Output:
Vector after insertion: 1 2 3 4 5 6
*/
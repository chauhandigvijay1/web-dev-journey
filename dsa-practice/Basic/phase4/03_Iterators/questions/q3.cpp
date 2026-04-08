/*
Question:
- Traverse vector using auto

Approach / Logic:
- Take vector input
- Use auto keyword for iterator
- Print values

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Modern C++ (auto + iterator)

Mistake / Note:
- auto automatically detects iterator type
*/


#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size of vector: ";
    cin >> n;
    vector<int> v(n);
    cout << "Enter elements of vector: ";
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    for(auto val : v) {
        cout << val << " ";
    }
    return 0;
}
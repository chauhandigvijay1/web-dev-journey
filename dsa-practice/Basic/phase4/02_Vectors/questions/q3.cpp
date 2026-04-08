/*
Question:
- Find maximum and minimum element in vector

Approach / Logic:
- Take vector input
- Initialize mini and maxi with first element
- Traverse vector and update min/max
- Print both values

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Array / Vector Traversal

Mistake / Note:
- Do not initialize min/max with 0
- Use first element to avoid incorrect answer
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Enter the size of the vector: ";
    int n;
    cin >> n;
    vector<int>v(n);
    cout << "Enter the elements of the vector: ";
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    int maxi = v[0], mini = v[0];
    for (int i = 1; i < n; i++) {
        mini= min(mini,v[i]);
        maxi= max(maxi,v[i]);

    }
    cout << "The maximum element in the vector is: " << maxi << endl;
    cout << "The minimum element in the vector is: " << mini << endl;
    return 0;
}
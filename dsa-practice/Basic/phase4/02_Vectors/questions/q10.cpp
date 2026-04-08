/*
Question:
- Prefix sum using vector

Approach / Logic:
- Take vector input
- Create prefix vector
- prefix[0] = v[0]
- prefix[i] = prefix[i-1] + v[i]
- Print prefix array

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Prefix Sum

Mistake / Note:
- First element manually assign karna hota hai
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;

    cout << "Enter size of vector: ";
    cin >> n;

    vector<int> v(n), prefix(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }

    prefix[0] = v[0];

    for (int i = 1; i < n; i++) {
        prefix[i] = prefix[i - 1] + v[i];
    }

    cout << "Prefix sum array: ";
    for (int i = 0; i < n; i++) {
        cout << prefix[i] << " ";
    }

    return 0;
}

/* Sample Input:
5
1 2 3 4 5

Sample Output:
Prefix sum array: 1 3 6 10 15
*/
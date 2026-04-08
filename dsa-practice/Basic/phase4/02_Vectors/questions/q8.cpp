/*
Question:
- Merge two vectors

Approach / Logic:
- Take input for both vectors
- Push elements of second into first
- Print merged vector

Time Complexity: O(n + m)
Space Complexity: O(n + m)

Pattern:
- Vector Merge

Mistake / Note:
- push_back() adds at end
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;

    cout << "Enter size of first vector: ";
    cin >> n;

    cout << "Enter size of second vector: ";
    cin >> m;

    vector<int> v1(n), v2(m);

    cout << "Enter elements of first vector: ";
    for (int i = 0; i < n; i++) cin >> v1[i];

    cout << "Enter elements of second vector: ";
    for (int i = 0; i < m; i++) cin >> v2[i];

    for (int i = 0; i < m; i++) {
        v1.push_back(v2[i]);
    }

    cout << "Merged vector: ";
    for (int i = 0; i < v1.size(); i++) {
        cout << v1[i] << " ";
    }

    return 0;
}

/* Sample Input:
3 3
1 2 3
4 5 6

Sample Output:
Merged vector: 1 2 3 4 5 6
*/
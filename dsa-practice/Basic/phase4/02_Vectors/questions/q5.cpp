/*
Question:
- Sort a vector

Approach / Logic:
- Take input from user
- Use sort() function
- Print sorted vector

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Sorting

Mistake / Note:
- sort(v.begin(), v.end()) → ascending order
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    vector<int> v(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }

    sort(v.begin(), v.end());

    cout << "Sorted vector: ";
    for (int i = 0; i < v.size(); i++) {
        cout << v[i] << " ";
    }

    return 0;
}

/* Sample Input:
5
4 2 8 1 6

Sample Output:
Sorted vector: 1 2 4 6 8
*/
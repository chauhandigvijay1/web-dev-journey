/*
Question:
- Find minimum element using STL

Approach / Logic:
- Take vector input
- Use min_element()
- Print min value

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Searching

Mistake / Note:
- min_element returns iterator
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    vector<int> v(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) cin >> v[i];

    int mini = *min_element(v.begin(), v.end());

    cout << "Minimum element: " << mini;

    return 0;
}

/* Sample Input:
5
4 1 9 2 7

Sample Output:
Minimum element: 1
*/
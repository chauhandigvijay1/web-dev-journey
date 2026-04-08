/*
Question:
- Find maximum element using STL

Approach / Logic:
- Take vector input
- Use max_element()
- Print max value

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Searching

Mistake / Note:
- max_element returns iterator
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

    int maxi = *max_element(v.begin(), v.end());

    cout << "Maximum element: " << maxi;

    return 0;
}

/* Sample Input:
5
4 1 9 2 7

Sample Output:
Maximum element: 9
*/
/*
Question:
- Check if element exists using find()

Approach / Logic:
- Take vector input
- Take element to search
- Use find()
- Compare with v.end()

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Search

Mistake / Note:
- find returns iterator
- If not found -> returns v.end()
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

    int x;
    cout << "Enter element to search: ";
    cin >> x;

    auto it = find(v.begin(), v.end(), x);

    if (it != v.end())
        cout << "Element found";
    else
        cout << "Element not found";

    return 0;
}

/* Sample Input:
5
1 2 3 4 5
3

Sample Output:
Element found
*/
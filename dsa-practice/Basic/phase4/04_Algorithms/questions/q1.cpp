/*
Question:
- Sort vector in ascending order

Approach / Logic:
- Take vector input
- Use sort(v.begin(), v.end())
- Print sorted vector

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Sorting

Mistake / Note:
- Default sort ascending hota hai
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    vector<int> v(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++)
    {
        cin >> v[i];
    }

    sort(v.begin(), v.end());

    cout << "Ascending order: ";
    for(auto x:v)
    {
        cout << x << " ";
    }

    return 0;
}

/* Sample Input:
5
4 2 8 1 6

Sample Output:
Ascending order: 1 2 4 6 8
*/
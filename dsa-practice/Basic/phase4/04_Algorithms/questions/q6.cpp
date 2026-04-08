/*
Question:
- Find sum using accumulate()

Approach / Logic:
- Take vector input
- Use accumulate(v.begin(), v.end(), 0)
- Print sum

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Accumulate

Mistake / Note:
- Third argument is initial value (0)
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

    int sum = accumulate(v.begin(), v.end(), 0);

    cout << "Sum: " << sum;

    return 0;
}

/* Sample Input:
5
1 2 3 4 5

Sample Output:
Sum: 15
*/
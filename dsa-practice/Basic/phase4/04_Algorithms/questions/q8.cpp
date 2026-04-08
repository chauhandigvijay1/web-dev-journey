/*
Question:
- Count occurrences using count()

Approach / Logic:
- Take vector input
- Take element to count
- Use count()
- Print result

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Counting

Mistake / Note:
- count counts total occurrences
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
    cout << "Enter element to count: ";
    cin >> x;

    int cnt = count(v.begin(), v.end(), x);

    cout << "Occurrences: " << cnt;

    return 0;
}

/* Sample Input:
6
1 2 3 2 2 4
2

Sample Output:
Occurrences: 3
*/
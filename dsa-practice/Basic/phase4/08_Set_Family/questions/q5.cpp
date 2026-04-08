/*
Question:
- Find first element greater than x using upper_bound()

Approach / Logic:
- Insert elements into set
- Use upper_bound(x)
- Print element if exists

Time Complexity: O(log n)
Space Complexity: O(n)

Pattern:
- Binary Search on Set

Mistake / Note:
- upper_bound gives strictly greater element
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    set<int> s;

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) {
        int val;
        cin >> val;
        s.insert(val);
    }

    int x;
    cout << "Enter x: ";
    cin >> x;

    auto it = s.upper_bound(x);

    if (it != s.end())
        cout << "Answer: " << *it;
    else
        cout << "No element greater than x";

    return 0;
}

/* Sample Input:
5
1 3 5 7 9
5

Sample Output:
Answer: 7
*/
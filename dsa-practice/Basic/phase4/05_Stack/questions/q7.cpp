/*
Question:
- Next Greater Element

Approach / Logic:
- Traverse from right
- Use stack to keep greater elements
- Pop smaller elements

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Monotonic Stack

Mistake / Note:
- Stack maintains decreasing order
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;

    cout << "Enter size: ";
    cin >> n;

    vector<int> v(n), ans(n);

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) cin >> v[i];

    stack<int> st;

    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && st.top() <= v[i])
            st.pop();

        if (st.empty()) ans[i] = -1;
        else ans[i] = st.top();

        st.push(v[i]);
    }

    cout << "Next Greater Elements: ";
    for (int x : ans) cout << x << " ";

    return 0;
}

/* Sample Input:
5
4 5 2 10 8

Sample Output:
Next Greater Elements: 5 10 10 -1 -1
*/
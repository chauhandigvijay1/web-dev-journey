/*
Question:
- Insert and print all elements of set

Approach / Logic:
- Take input size
- Insert elements into set
- Traverse set and print elements

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Set Basics

Mistake / Note:
- Set automatically sorts and removes duplicates
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
        int x;
        cin >> x;
        s.insert(x);
    }

    cout << "Set elements: ";
    for (auto x : s) {
        cout << x << " ";
    }

    return 0;
}

/* Sample Input:
5
4 2 8 2 1

Sample Output:
Set elements: 1 2 4 8
*/
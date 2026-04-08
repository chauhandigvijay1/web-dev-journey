/*
Question:
- Traverse set using iterator

Approach / Logic:
- Take input elements
- Insert into set
- Declare set<int>::iterator
- Loop from begin() to end()
- Print values using *it

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- STL Set Traversal

Mistake / Note:
- Set me sirf values hoti hain (no key-value)
- *it se value milti hai
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

    cout << "Set elements using iterator: ";

    set<int>::iterator it;

    for (it = s.begin(); it != s.end(); it++) {
        cout << *it << " ";
    }

    return 0;
}

/* Sample Input:
5
4 2 8 2 1

Sample Output:
Set elements using iterator: 1 2 4 8
*/
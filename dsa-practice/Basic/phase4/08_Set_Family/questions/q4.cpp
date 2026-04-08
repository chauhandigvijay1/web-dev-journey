/*
Question:
- Check if element exists in set

Approach / Logic:
- Insert elements into set
- Take element to search
- Use find()
- Compare with s.end()

Time Complexity: O(log n)
Space Complexity: O(n)

Pattern:
- Set Search

Mistake / Note:
- Set search is faster than vector
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

    int x;
    cout << "Enter element to search: ";
    cin >> x;

    if (s.find(x) != s.end())
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
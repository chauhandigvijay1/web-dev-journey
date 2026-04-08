/*
Question:
- Remove duplicates from array using set

Approach / Logic:
- Take array input
- Insert all elements into set
- Set automatically removes duplicates
- Print elements of set

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Set for duplicate removal

Mistake / Note:
- Set always stores unique elements in sorted order
- Order of original array is NOT preserved
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter size: ";
    cin >> n;

    int arr[n];   // (Works in GCC, but not standard C++)

    cout << "Enter elements:\n";
    for (int i = 0; i < n; i++) {
        cout << "Enter " << i + 1 << " value: ";
        cin >> arr[i];
    }

    set<int> s;

    for (int i = 0; i < n; i++) {
        s.insert(arr[i]);
    }

    cout << "Array after removing duplicates: ";
    for (auto val : s) {
        cout << val << " ";
    }

    return 0;
}

/* Sample Input:
6
1 2 2 3 4 3

Sample Output:
Array after removing duplicates: 1 2 3 4
*/
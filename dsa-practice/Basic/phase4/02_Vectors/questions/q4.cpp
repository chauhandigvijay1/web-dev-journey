/*
Question:
- Reverse a vector

Approach / Logic:
- Take vector input
- Use reverse() STL function
- Print reversed vector

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- STL Vector Operation

Mistake / Note:
- reverse(v.begin(), v.end()) reverses whole vector
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter the size of the vector: ";
    cin >> n;

    vector<int> v(n);
    cout << "Enter the elements of the vector: ";
    for (int i = 0; i < n; i++) {
        cout << "Element " << i + 1 << ": ";
        cin >> v[i];
    }

    reverse(v.begin(), v.end());

    for (int i = 0; i < n; i++) {
        cout<<"Reversed Element " << i + 1 << ": ";
        cout << v[i] << endl;
    }

    return 0;
}

/* Sample Input:
5
1 2 3 4 5

Sample Output:
5 4 3 2 1

Dry Run / Notes:
- Original: [1,2,3,4,5]
- Reversed: [5,4,3,2,1]
*/
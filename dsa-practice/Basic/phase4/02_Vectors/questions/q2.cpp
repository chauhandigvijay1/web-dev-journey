/*
Question:
- Find sum of all elements in vector

Approach / Logic:
- Take vector input
- Traverse vector using loop
- Add each element to sum
- Print final sum

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Traversal / Accumulation

Mistake / Note:
- Initialize sum = 0 before loop
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int sum=0;
    cout << "Enter the size of the vector: ";
    int n;
    cin >> n;
    vector<int>v(n);
    cout << "Enter the elements of the vector: ";
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    for(int i = 0; i < n; i++) {
        sum=sum+v[i];
    }
    cout << "The sum of the elements of the vector is: " << sum << endl;
    return 0;
}
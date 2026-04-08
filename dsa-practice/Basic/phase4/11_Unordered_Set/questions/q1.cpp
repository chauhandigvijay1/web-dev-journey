/*
Question:
- Remove duplicates using unordered_set

Approach / Logic:
- Take array input
- Insert elements into unordered_set
- Print elements (unique)

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Hashing / Duplicate Removal

Mistake / Note:
- unordered_set order maintain nahi karta
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

    unordered_set<int> s;

    for(auto x:v){
        s.insert(x);
    }
    
    cout << "After removing duplicates: ";
    for (auto x : s) cout << x << " ";

    return 0;
}

/* Sample Input:
6
1 2 2 3 4 3

Sample Output:
After removing duplicates: 3 1 4 2   (order may vary)
*/
/*
Question:
- Count frequency of elements in array

Approach / Logic:
- Take array input
- Use map<int, int>
- Increase count for each element
- Print frequencies

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Frequency Count using Map

Mistake / Note:
- mp[x]++ automatically handles new keys
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

    map<int, int> mp;

   for(int i=0; i<n; i++) {
        mp[v[i]]++;
    }

    cout << "Frequencies:\n";
    for (auto val : mp) {
        cout << val.first << " -> " << val.second << endl;
    }

    return 0;
}

/* Sample Input:
6
1 2 2 3 3 3

Sample Output:
Frequencies:
1 -> 1
2 -> 2
3 -> 3
*/
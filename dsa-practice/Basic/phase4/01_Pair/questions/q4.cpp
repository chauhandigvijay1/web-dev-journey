/*
Question:
- Create array of pairs and print all values

Approach / Logic:
- Create an array of pair<int, int>
- Store values in each index
- Traverse the array and print each pair

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Array + STL Pair

Mistake / Note:
- Access pair in array like arr[i].first and arr[i].second
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter number of pairs: ";
    cin >> n;
    pair<int, int> p[n];
    cout << "Enter pairs (first second):" << endl;
    for (int i = 0; i < n; i++) {
        cin >> p[i].first >> p[i].second;
    }
    cout << "You entered the following pairs:" << endl;
    for (int i = 0; i < n; i++) {
        cout << p[i].first << " " << p[i].second << endl;
    }
    return 0;
}
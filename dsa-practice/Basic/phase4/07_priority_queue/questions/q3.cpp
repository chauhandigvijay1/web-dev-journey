/*
Question:
- Find Kth largest element

Approach / Logic:
- Use min heap of size k
- Keep only k largest elements
- Top = kth largest

Time Complexity: O(n log k)
Space Complexity: O(k)

Pattern:
- Heap (Top K)

Mistake / Note:
- Maintain heap size = k
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cout << "Enter size and k: ";
    cin >> n >> k;

    vector<int> v(n);
    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) cin >> v[i];

    priority_queue<int, vector<int>, greater<int>> pq;

    for (int x : v) {
        pq.push(x);
        if (pq.size() > k)
            pq.pop();
    }

    cout << "Kth largest: " << pq.top();

    return 0;
}

/* Sample Input:
6 2
3 2 1 5 6 4

Sample Output:
Kth largest: 5
*/
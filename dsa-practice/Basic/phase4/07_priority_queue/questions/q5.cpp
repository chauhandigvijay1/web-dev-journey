/*
Question:
- Top K frequent elements

Approach / Logic:
- Count frequency using map
- Use min heap (freq, element)
- Keep top k frequent

Time Complexity: O(n log k)
Space Complexity: O(n)

Pattern:
- Heap + Hashing

Mistake / Note:
- Heap stores pair(freq, element)
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

    unordered_map<int, int> mp;
    for (int x : v) mp[x]++;

    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;

    for (auto it : mp) {
        pq.push({it.second, it.first});
        if (pq.size() > k)
            pq.pop();
    }

    cout << "Top K frequent: ";
    while (!pq.empty()) {
        cout << pq.top().second << " ";
        pq.pop();
    }

    return 0;
}

/* Sample Input:
6 2
1 1 1 2 2 3

Sample Output:
Top K frequent: 2 1
*/
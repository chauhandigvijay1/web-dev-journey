/*
Question:
- Merge K sorted arrays

Approach / Logic:
- Push all elements into min heap
- Extract in sorted order

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Heap Merge
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<vector<int>> arr = {{1,4,7}, {2,5,8}, {3,6,9}};

    priority_queue<int, vector<int>, greater<int>> pq;

    for (auto row : arr)
        for (int x : row)
            pq.push(x);

    cout << "Merged array: ";
    while (!pq.empty()) {
        cout << pq.top() << " ";
        pq.pop();
    }

    return 0;
}
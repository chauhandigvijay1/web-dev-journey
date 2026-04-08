/*
Question:
- Implement min heap operations

Approach / Logic:
- Use priority_queue with greater<int>
- push, pop, top

Time Complexity: O(log n)
Space Complexity: O(n)

Pattern:
- Min Heap

Mistake / Note:
- Use greater<int> for min heap
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    priority_queue<int, vector<int>, greater<int>> pq;

    cout << "Enter number of elements: ";
    int n; cin >> n;

    cout << "Enter elements: ";
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        pq.push(x);
    }

    cout << "Min Heap elements: ";
    while (!pq.empty()) {
        cout << pq.top() << " ";
        pq.pop();
    }

    return 0;
}

/* Sample Input:
5
1 5 2 10 3

Sample Output:
Min Heap elements: 1 2 3 5 10
*/
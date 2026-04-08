/*
Question:
- Minimum cost to connect ropes

Approach / Logic:
- Always pick 2 smallest ropes
- Add cost
- Push back sum

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- Greedy + Min Heap

Mistake / Note:
- Always smallest 2 pick karo
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter number of ropes: ";
    cin >> n;

    priority_queue<int, vector<int>, greater<int>> pq;

    cout << "Enter rope lengths: ";
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        pq.push(x);
    }

    int cost = 0;

    while (pq.size() > 1) {
        int a = pq.top(); pq.pop();
        int b = pq.top(); pq.pop();

        int sum = a + b;
        cost += sum;

        pq.push(sum);
    }

    cout << "Minimum cost: " << cost;

    return 0;
}

/* Sample Input:
4
4 3 2 6

Sample Output:
Minimum cost: 29
*/
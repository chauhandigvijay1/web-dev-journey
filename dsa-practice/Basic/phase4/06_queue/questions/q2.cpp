/*
Question:
- Print all elements of queue

Approach / Logic:
- Use while loop
- Print front and pop

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Queue Traversal

Mistake / Note:
- Queue empty ho jayega
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    queue<int> q;

    q.push(1);
    q.push(2);
    q.push(3);

    cout << "Queue elements: ";

    while (!q.empty()) {
        cout << q.front() << " ";
        q.pop();
    }

    return 0;
}

/* Sample Output:
Queue elements: 1 2 3
*/
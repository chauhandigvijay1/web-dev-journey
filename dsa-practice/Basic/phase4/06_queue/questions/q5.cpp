/*
Question:
- Implement stack using queue

Approach / Logic:
- Use one queue
- Push: insert element and rotate queue
- Top always at front

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Stack using Queue

Mistake / Note:
- Rotate queue after push
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    queue<int> q;

    // push
    q.push(10);
    q.push(20);
    q.push(30);

    // rotate
    for (int i = 0; i < 2; i++) {
        q.push(q.front());
        q.pop();
    }

    cout << "Top (stack behavior): " << q.front();

    return 0;
}

/* Sample Output:
Top (stack behavior): 30
*/
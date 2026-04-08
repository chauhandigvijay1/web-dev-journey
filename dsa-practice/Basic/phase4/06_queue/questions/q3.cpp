/*
Question:
- Reverse a queue

Approach / Logic:
- Use stack
- Push all elements into stack
- Pop from stack and push back to queue

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Queue + Stack

Mistake / Note:
- Stack reverses order
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    queue<int> q;

    q.push(1);
    q.push(2);
    q.push(3);

    stack<int> st;

    while (!q.empty()) {
        st.push(q.front());
        q.pop();
    }

    while (!st.empty()) {
        q.push(st.top());
        st.pop();
    }

    cout << "Reversed queue: ";

    while (!q.empty()) {
        cout << q.front() << " ";
        q.pop();
    }

    return 0;
}

/* Sample Output:
Reversed queue: 3 2 1
*/
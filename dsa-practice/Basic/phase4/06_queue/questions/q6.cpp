/*
Question:
- Implement queue using stack

Approach / Logic:
- Use 2 stacks
- Push in stack1
- Pop from stack2
- If stack2 empty → transfer from stack1

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Queue using Stack

Mistake / Note:
- Transfer only when needed
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    stack<int> s1, s2;

    // push
    s1.push(1);
    s1.push(2);
    s1.push(3);

    // pop operation
    if (s2.empty()) {
        while (!s1.empty()) {
            s2.push(s1.top());
            s1.pop();
        }
    }

    cout << "Front (queue behavior): " << s2.top();

    return 0;
}

/* Sample Output:
Front (queue behavior): 1
*/
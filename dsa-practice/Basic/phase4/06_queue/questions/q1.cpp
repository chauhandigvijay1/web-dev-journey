/*
Question:
- Implement basic queue operations

Approach / Logic:
- Use queue<int>
- Perform push, pop, front operations

Time Complexity: O(1)
Space Complexity: O(n)

Pattern:
- Queue Basics

Mistake / Note:
- front() gives first element
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    queue<int> q;

    cout << "Pushing elements: 10, 20, 30\n";
    q.push(10);
    q.push(20);
    q.push(30);

    cout << "Front element: " << q.front() << endl;

    q.pop();

    cout << "Front after pop: " << q.front() << endl;

    return 0;
}

/* Sample Output:
Pushing elements: 10, 20, 30
Front element: 10
Front after pop: 20
*/
/*
Question:
- Implement basic stack operations

Approach / Logic:
- Use stack<int>
- Perform push, pop, top operations

Time Complexity: O(1)
Space Complexity: O(n)

Pattern:
- Stack Basics

Mistake / Note:
- pop() value return nahi karta
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    stack<int> st;

    cout << "Pushing elements: 10, 20, 30\n";
    st.push(10);
    st.push(20);
    st.push(30);

    cout << "Top element: " << st.top() << endl;

    st.pop();

    cout << "Top after pop: " << st.top() << endl;

    return 0;
}

/* Sample Output:
Pushing elements: 10, 20, 30
Top element: 30
Top after pop: 20
*/
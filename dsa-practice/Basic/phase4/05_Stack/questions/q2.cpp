/*
Question:
- Print all elements of stack

Approach / Logic:
- Use while loop
- Print top and pop until empty

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Stack Traversal

Mistake / Note:
- Original stack destroy ho jata hai
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    stack<int> st;

    st.push(1);
    st.push(2);
    st.push(3);

    cout << "Stack elements: ";

    while (!st.empty()) {
        cout << st.top() << " ";
        st.pop();
    }

    return 0;
}

/* Sample Output:
Stack elements: 3 2 1
*/
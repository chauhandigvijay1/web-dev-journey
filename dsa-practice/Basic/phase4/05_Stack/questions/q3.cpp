/*
Question:
- Reverse a string using stack

Approach / Logic:
- Push all characters into stack
- Pop and build reversed string

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Stack + String

Mistake / Note:
- Stack reverses order automatically
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;

    cout << "Enter string: ";
    cin >> s;

    stack<char> st;

    for (char c : s) st.push(c);

    cout << "Reversed string: "; 

    while (!st.empty()) {
        cout << st.top();
        st.pop();
    }

    return 0;
}

/* Sample Input:
hello

Sample Output:
Reversed string: olleh
*/
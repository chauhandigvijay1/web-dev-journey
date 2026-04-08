/*
Question:
- Valid parentheses (multiple types)

Approach / Logic:
- Push opening brackets
- Match with closing brackets
- Check all types: (), {}, []

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Stack Matching

Mistake / Note:
- Check matching pairs properly
*/

#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    stack<char> st;

    for (char c : s) {
        if (c == '(' || c == '{' || c == '[')
            st.push(c);
        else {
            if (st.empty()) return false;

            if ((c == ')' && st.top() != '(') ||
                (c == '}' && st.top() != '{') ||
                (c == ']' && st.top() != '['))
                return false;

            st.pop();
        }
    }

    return st.empty();
}

int main() {
    string s;

    cout << "Enter expression: ";
    cin >> s;

    if (isValid(s))
        cout << "Valid";
    else
        cout << "Invalid";

    return 0;
}

/* Sample Input:
{[()]}

Sample Output:
Valid
*/
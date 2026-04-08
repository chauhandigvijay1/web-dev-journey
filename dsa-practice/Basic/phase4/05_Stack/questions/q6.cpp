/*
Question:
- Remove adjacent duplicates

Approach / Logic:
- Traverse string
- If stack top == current → pop
- Else push

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Stack + String

Mistake / Note:
- Adjacent duplicates hi remove hote hain
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;

    cout << "Enter string: ";
    cin >> s;

    stack<char> st;

    for (char c : s) {
        if (!st.empty() && st.top() == c)
            st.pop();
        else
            st.push(c);
    }

    string result = "";
    while (!st.empty()) {
        result += st.top();
        st.pop();
    }

    reverse(result.begin(), result.end());

    cout << "Result: " << result;

    return 0;
}

/* Sample Input:
abbaca
Sample Output:
Result: ca
*/
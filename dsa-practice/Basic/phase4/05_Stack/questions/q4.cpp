#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cout << "Enter a string: ";
    cin >> s;

    stack<char> st;
    for (auto ch : s) {
        if(ch == '(' || ch == '{' || ch == '[') {
            st.push(ch);
        } else {
            if (st.empty()) {
                cout << "Unbalanced parentheses\n";
                return 0;
            }
            st.pop();
        }
    }
    if (!st.empty()) {
        cout << "Unbalanced parentheses\n";
    } else {
        cout << "Balanced parentheses\n";
    } 
    return 0;
}
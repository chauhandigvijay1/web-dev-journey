/*
Question:
- Count frequency of characters in string

Approach / Logic:
- Take string input
- Use map<char, int>
- Count each character
- Print result

Time Complexity: O(n log n)
Space Complexity: O(n)

Pattern:
- String Frequency

Mistake / Note:
- Space also counts as character (if present)
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cout << "Enter string: ";
    cin >> s;

    map<char, int> mp;

    for (int i= 0; i<s.size(); i++) {
        mp[s[i]]++;
    }

    cout << "Character frequencies:\n";
    for (auto val : mp) {
        cout << val.first << " -> " << val.second << endl;
    }

    return 0;
}

/* Sample Input:
aabbc

Sample Output:
a -> 2
b -> 2
c -> 1
*/
/*
Question:
- Generate binary numbers from 1 to N

Approach / Logic:
- Use queue<string>
- Start with "1"
- For each element:
  print it
  push (element + "0") and (element + "1")

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- BFS using Queue

Mistake / Note:
- Queue helps generate sequence level-wise
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;

    cout << "Enter N: ";
    cin >> n;

    queue<string> q;
    q.push("1");

    cout << "Binary numbers: ";

    for (int i = 0; i < n; i++) {
        string s = q.front();
        q.pop();

        cout << s << " ";

        q.push(s + "0");
        q.push(s + "1");
    }

    return 0;
}

/* Sample Input:
5

Sample Output:
Binary numbers: 1 10 11 100 101
*/
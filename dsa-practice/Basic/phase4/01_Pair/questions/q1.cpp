/*
Question:
- Store and print a pair

Approach / Logic:
- Use pair<int, int> to store two values
- Access values using .first and .second
- Print both values

Time Complexity: O(1)
Space Complexity: O(1)

Pattern:
- STL Pair Basics

Mistake / Note:
- Pair stores exactly 2 values
- Access only using .first and .second
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    pair<int, int> p = {10, 20};

    cout << p.first << " " << p.second << endl;

    return 0;
}

/* Sample Input:
(No input)

Sample Output:
10 20

Dry Run / Notes:
- p = {10, 20}
- p.first = 10
- p.second = 20
*/
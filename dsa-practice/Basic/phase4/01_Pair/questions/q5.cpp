/*
Question:
- Use nested pair and print all values

Approach / Logic:
- Create a nested pair:
  pair<int, pair<int, int>>
- Access outer value using .first
- Access inner pair values using .second.first and .second.second
- Print all values

Time Complexity: O(1)
Space Complexity: O(1)

Pattern:
- Nested STL Pair

Mistake / Note:
- Nested pair access:
  p.first
  p.second.first
  p.second.second
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    pair<int, pair<int, int>> p = {1, {2, 3}};

    cout << p.first << " ";
    cout << p.second.first << " ";
    cout << p.second.second << endl;

    return 0;
}

/* Sample Input:
(No input)

Sample Output:
1 2 3

Dry Run / Notes:
- p = {1, {2, 3}}
- p.first = 1
- p.second.first = 2
- p.second.second = 3
*/
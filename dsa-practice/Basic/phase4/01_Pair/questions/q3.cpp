/*
Question:
- Swap two pairs

Approach / Logic:
- Create two pairs
- Use swap() function to exchange them
- Print before and after swap

Time Complexity: O(1)
Space Complexity: O(1)

Pattern:
- STL Pair Operations

Mistake / Note:
- swap() exchanges complete pair, not individual elements
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    pair<int, int> p1 = {1, 2};
    pair<int, int> p2 = {3, 4};

    cout << "Before Swap:" << endl;
    cout << p1.first << " " << p1.second << endl;
    cout << p2.first << " " << p2.second << endl;

    swap(p1, p2);

    cout << "After Swap:" << endl;
    cout << p1.first << " " << p1.second << endl;
    cout << p2.first << " " << p2.second << endl;

    return 0;
}

/* Sample Input:
(No input)

Sample Output:
Before Swap:
1 2
3 4
After Swap:
3 4
1 2

Dry Run / Notes:
- Initially:
  p1 = {1, 2}
  p2 = {3, 4}
- After swap:
  p1 = {3, 4}
  p2 = {1, 2}
*/
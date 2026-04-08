/*
Question:
- Take pair input from user

Approach / Logic:
- Declare a pair<int, int>
- Take input in two variables directly into pair
- Print the pair values

Time Complexity: O(1)
Space Complexity: O(1)

Pattern:
- STL Pair Input/Output

Mistake / Note:
- Input order matters
- First entered value goes to .first, second to .second
*/

#include <bits/stdc++.h>
using namespace std;

int main() {

    pair<int, int> p;
    cout << "Enter two integers: ";
    cin >> p.first >> p.second;

    cout << p.first << " " << p.second << endl;
    return 0;
}

/* Sample Input:
5 9

Sample Output:
5 9

Dry Run / Notes:
- Input: 5 9
- p.first = 5
- p.second = 9
*/
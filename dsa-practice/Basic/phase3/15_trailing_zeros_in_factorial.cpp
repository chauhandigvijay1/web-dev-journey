/*
    Question: Trailing Zeros in Factorial

    Problem:
    Given a number n, find how many trailing zeros are present in n!

    Example:
    5! = 120 -> 1 trailing zero
    10! = 3628800 -> 2 trailing zeros

    Approach:
    - Count how many times 5 comes in factorial
    - Because 2s are always more than enough
    - Formula:
      count += n/5 + n/25 + n/125 ...
*/

#include <bits/stdc++.h>
using namespace std;

// Function to count trailing zeros in factorial
int trailingZeros(int n) {
    int count = 0;

    while(n > 0) {
        n = n / 5;
        count += n;
    }

    return count;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Trailing zeros in factorial = " << trailingZeros(n) << endl;

    return 0;
}

/*
Sample Output:
Enter a number: 10
Trailing zeros in factorial = 2
*/
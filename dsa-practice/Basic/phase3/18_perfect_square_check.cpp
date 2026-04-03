/*
    Question: Perfect Square Check

    Problem:
    Check whether a number is a Perfect Square or not.

    Example:
    25 -> 5 * 5 = 25

    Approach:
    - Find square root of number
    - If square of root is same as number, then it is perfect square
*/

#include <bits/stdc++.h>
using namespace std;

// Function to check perfect square
bool isPerfectSquare(int n) {
    if(n < 0) return false;

    int root = sqrt(n);
    return root * root == n;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isPerfectSquare(n)) {
        cout << n << " is a Perfect Square." << endl;
    } 
    else {
        cout << n << " is NOT a Perfect Square." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 49
49 is a Perfect Square.
*/
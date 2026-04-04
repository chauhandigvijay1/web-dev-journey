/*
    Question: Happy Number

    Problem:
    Check whether a number is a Happy Number or not.
    A Happy Number becomes 1 after repeatedly replacing the number
    with the sum of squares of its digits.

    Example:
    19 -> 1^2 + 9^2 = 82
    82 -> 8^2 + 2^2 = 68
    68 -> 6^2 + 8^2 = 100
    100 -> 1

    Approach:
    - Keep replacing number with sum of squares of digits
    - If it becomes 1, then it is Happy Number
    - If it starts repeating and becomes 4, then it is not Happy
*/

#include <bits/stdc++.h>
using namespace std;

// Function to find sum of squares of digits
int sumOfSquareDigits(int n) {
    int sum = 0;

    while(n > 0) {
        int digit = n % 10;
        sum += digit * digit;
        n = n / 10;
    }

    return sum;
}

// Function to check Happy Number
bool isHappy(int n) {
    while(n != 1 && n != 4) {
        n = sumOfSquareDigits(n);
    }

    if(n == 1){
    return true;
    }
    return false;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isHappy(n)) {
        cout << n << " is a Happy Number." << endl;
    } 
    else {
        cout << n << " is NOT a Happy Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 19
19 is a Happy Number.
*/
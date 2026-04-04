/*
    Question: Harshad Number

    Problem:
    Check whether a number is a Harshad Number or not.
    A Harshad Number is divisible by the sum of its digits.

    Example:
    18 -> sum of digits = 9
    18 % 9 == 0

    Approach:
    - Find sum of digits
    - Check if number is divisible by that sum
*/

#include <bits/stdc++.h>
using namespace std;

// Function to find sum of digits
int sumOfDigits(int n) {
    n = abs(n);
    int sum = 0;

    while(n > 0) {
        sum += n % 10;
        n = n / 10;
    }

    return sum;
}

// Function to check Harshad Number
bool isHarshad(int n) {
    int sum = sumOfDigits(n);

    if(sum == 0 || n % sum != 0) return false;

    return true;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isHarshad(n)) {
        cout << n << " is a Harshad Number." << endl;
    } 
    else {
        cout << n << " is NOT a Harshad Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 18
18 is a Harshad Number.
*/
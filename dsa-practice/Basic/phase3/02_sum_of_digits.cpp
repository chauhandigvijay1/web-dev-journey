/*
    Question: Sum of Digits of a Number

    Problem:
    Given a number, find the sum of all its digits.

    Approach:
    - Extract each digit using % 10
    - Add it to sum
    - Remove last digit using / 10
*/

#include <bits/stdc++.h>
using namespace std;

// Function to find sum of digits
int sumOfDigits(int n) {
    n = abs(n);
    int sum = 0;

    while(n > 0) {
        int digit = n % 10;
        sum += digit;
        n = n / 10;
    }

    return sum;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Sum of digits = " << sumOfDigits(n) << endl;

    return 0;
}

/*
Sample Output:
Enter a number: 1234
Sum of digits = 10
*/
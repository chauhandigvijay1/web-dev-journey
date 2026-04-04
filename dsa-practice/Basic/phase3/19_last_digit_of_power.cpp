/*
    Question: Last Digit of Power

    Problem:
    Given two numbers a and b, find the last digit of a^b.

    Example:
    7^2 = 49 -> last digit = 9

    Approach:
    - Calculate power using loop
    - Keep only last digit using % 10
*/

#include <bits/stdc++.h>
using namespace std;

// Function to find last digit of a^b
int lastDigitOfPower(int a, int b) {
    int result = 1;
    result= pow(a,b);

    int lastdigit = result % 10;

    return lastdigit;
}

int main() {
    int a, b;

    cout << "Enter base: ";
    cin >> a;

    cout << "Enter power: ";
    cin >> b;

    cout << "Last digit of " << a << "^" << b << " = " << lastDigitOfPower(a, b) << endl;

    return 0;
}

/*
Sample Output:
Enter base: 7
Enter power: 4
Last digit of 7^4 = 1
*/
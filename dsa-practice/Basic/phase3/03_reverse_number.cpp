/*
    Question: Reverse a Number

    Problem:
    Given a number, reverse its digits.

    Approach:
    - Extract last digit using % 10
    - Add it to reversed number
    - Remove last digit using / 10
*/

#include <bits/stdc++.h>
using namespace std;

// Function to reverse number
int reverseNumber(int n) {
    int rev = 0;
    int sign = (n < 0) ? -1 : 1;
    n = abs(n);

    while(n > 0) {
        int digit = n % 10;
        rev = rev * 10 + digit;
        n = n / 10;
    }

    return rev * sign;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Reversed number = " << reverseNumber(n) << endl;

    return 0;
}

/*
Sample Output:
Enter a number: 12345
Reversed number = 54321
*/
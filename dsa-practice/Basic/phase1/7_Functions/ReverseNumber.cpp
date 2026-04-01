/*
    Question: Reverse Number using Function

    Problem:
    Create a function to reverse a number.

    Approach:
    - Create reverseNumber() function
    - Extract digits and form reversed number
    - Return reversed number
*/

#include <bits/stdc++.h>
using namespace std;

int reverseNumber(int n) {
    int rev = 0;

    while(n > 0) {
        int digit = n % 10;
        rev = rev * 10 + digit;
        n = n / 10;
    }

    return rev;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Reversed number is: " << reverseNumber(n) << endl;

    return 0;
}

/*
Sample Input:
1234

Sample Output:
Reversed number is: 4321
*/
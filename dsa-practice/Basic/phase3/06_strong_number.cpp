/*
    Question: Strong Number

    Problem:
    Check whether a number is a Strong Number or not.
    A Strong Number is a number where sum of factorial of digits
    is equal to the number itself.

    Example:
    145 = 1! + 4! + 5!

    Approach:
    - Extract each digit
    - Find factorial of each digit
    - Add all factorials
    - Compare sum with original number
*/

#include <bits/stdc++.h>
using namespace std;

// Function to find factorial
int factorial(int n) {
    int fact = 1;
    for(int i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

// Function to check Strong Number
bool isStrong(int n) {
    int original = n;
    n = abs(n);

    int sum = 0, temp = n;

    while(temp > 0) {
        int digit = temp % 10;
        sum += factorial(digit);
        temp = temp / 10;
    }

    return sum == n;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isStrong(n)) {
        cout << n << " is a Strong Number." << endl;
    } 
    else {
        cout << n << " is NOT a Strong Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 145
145 is a Strong Number.
*/
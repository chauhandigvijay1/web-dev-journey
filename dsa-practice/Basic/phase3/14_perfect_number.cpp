/*
    Question: Perfect Number

    Problem:
    Check whether a number is a Perfect Number or not.
    A Perfect Number is a number whose sum of proper divisors
    is equal to the number itself.

    Example:
    6 -> proper divisors = 1, 2, 3
    sum = 6

    Approach:
    - Find all divisors except the number itself
    - Add them
    - Compare sum with original number
*/

#include <bits/stdc++.h>
using namespace std;

// Function to check perfect number
bool isPerfect(int n) {
    if(n <= 1) return false;

    int sum = 0;

    for(int i = 1; i < n; i++) {
        if(n % i == 0) {
            sum += i;
        }
    }

    return sum == n;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isPerfect(n)) {
        cout << n << " is a Perfect Number." << endl;
    } 
    else {
        cout << n << " is NOT a Perfect Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 6
6 is a Perfect Number.
*/
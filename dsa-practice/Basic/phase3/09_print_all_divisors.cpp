/*
    Question: Print All Divisors

    Problem:
    Given a number, print all its divisors.

    Approach:
    - Run loop from 1 to n
    - If n % i == 0, then i is a divisor
*/

#include <bits/stdc++.h>
using namespace std;

// Function to print divisors
void printDivisors(int n) {
    n = abs(n);

    cout << "Divisors are: ";
    for(int i = 1; i <= n; i++) {
        if(n % i == 0) {
            cout << i << " ";
        }
    }
    cout << endl;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    printDivisors(n);

    return 0;
}

/*
Sample Output:
Enter a number: 12
Divisors are: 1 2 3 4 6 12
*/
/*
    Question: Prime Factorization

    Problem:
    Given a number, print all its prime factors.

    Example:
    84 = 2 2 3 7

    Approach:
    - Start dividing from 2
    - If number is divisible, print factor and divide it
    - Keep doing until number becomes 1
*/

#include <bits/stdc++.h>
using namespace std;

// Function to print prime factors
void primeFactorization(int n) {
    n = abs(n);

    cout << "Prime factors are: ";

    for(int i = 2; i <= n; i++) {
        while(n % i == 0) {
            cout << i << " ";
            n = n / i;
        }
    }

    cout << endl;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(n <= 1) {
        cout << "Prime factorization is not possible for this number." << endl;
    } 
    else {
        primeFactorization(n);
    }

    return 0;
}

/*
Sample Output:
Enter a number: 84
Prime factors are: 2 2 3 7
*/
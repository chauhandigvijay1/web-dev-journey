/*
    Question: Print Prime Numbers in a Range

    Problem:
    Given two numbers, print all prime numbers between them.

    Approach:
    - Use a helper function to check if a number is prime
    - Run loop from start to end
    - Print number if it is prime
*/

#include <bits/stdc++.h>
using namespace std;

// Function to check prime
bool isPrime(int n) {
    if(n <= 1) {
        return false;
    }

    for(int i = 2; i < n; i++) {
        if(n % i == 0) {
            return false;
        }
    }

    return true;
}

int main() {
    int start, end;

    cout << "Enter starting number: ";
    cin >> start;

    cout << "Enter ending number: ";
    cin >> end;

    cout << "Prime numbers are: ";
    for(int i = start; i <= end; i++) {
        if(isPrime(i)) {
            cout << i << " ";
        }
    }

    cout << endl;

    return 0;
}

/*
Sample Output:
Enter starting number: 1
Enter ending number: 20
Prime numbers are: 2 3 5 7 11 13 17 19
*/
/*
    Question: Count Total Divisors

    Problem:
    Given a number, count how many divisors it has.

    Approach:
    - Run loop from 1 to n
    - If n % i == 0, increase count
*/

#include <bits/stdc++.h>
using namespace std;

// Function to count divisors
int countDivisors(int n) {
    n = abs(n);
    int count = 0;

    for(int i = 1; i <= n; i++) {
        if(n % i == 0) {
            count++;
        }
    }

    return count;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Total divisors = " << countDivisors(n) << endl;

    return 0;
}

/*
Sample Output:
Enter a number: 12
Total divisors = 6
*/
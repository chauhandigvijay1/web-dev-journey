/*
    Question: Factorial

    Problem:
    Find factorial of a number.

    Approach:
    - Multiply numbers from 1 to N
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long fact = 1;
    cout<<"Enter a no. of which factorial to be calculated:";
    cin >> n;

    for(int i = 1; i <= n; i++) {
        fact *= i;
    }

    cout << "Factorial: " << fact;

    return 0;
}

/*
Sample Input:
5

Sample Output:
Factorial: 120
*/
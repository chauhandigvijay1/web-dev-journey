/*
    Question: Power (a^b)

    Problem:
    Find a raised to power b.

    Approach:
    - Multiply a, b times
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int a, b;
    long long result = 1;
    cout<<"Enter base: ";
    cin >> a;
    cout<<"Enter power: ";
    cin >> b;

    for(int i = 1; i <= b; i++) {
        result *= a;
    }

    cout << "Power: " << result;

    return 0;
}

/*
Sample Input:
2 5

Sample Output:
Power: 32
*/
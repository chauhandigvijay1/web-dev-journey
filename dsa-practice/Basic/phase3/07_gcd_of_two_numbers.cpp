/*
    Question: GCD of Two Numbers

    Problem:
    Find the Greatest Common Divisor (GCD) of two numbers.

    Approach:
    - Use Euclidean Algorithm
    - Keep replacing:
      a = b
      b = a % b
    - When b becomes 0, a is the GCD
*/

#include <bits/stdc++.h>
using namespace std;

// Function to find GCD
int findGCD(int a, int b) {
    a = abs(a);
    b = abs(b);

    while(b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }

    return a;
}

int main() {
    int a, b;

    cout << "Enter two numbers: ";
    cin >> a >> b;

    cout << "GCD = " << findGCD(a, b) << endl;

    return 0;
}

/*
Sample Output:
Enter two numbers: 12 18
GCD = 6
*/
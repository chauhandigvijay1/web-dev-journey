/*
    Question: LCM of Two Numbers

    Problem:
    Find the Least Common Multiple (LCM) of two numbers.

    Approach:
    - First find GCD
    - Then use formula:
      LCM = (a * b) / GCD
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

// Function to find LCM
int findLCM(int a, int b) {
    return abs(a * b) / findGCD(a, b);
}

int main() {
    int a, b;

    cout << "Enter two numbers: ";
    cin >> a >> b;

    cout << "LCM = " << findLCM(a, b) << endl;

    return 0;
}

/*
Sample Output:
Enter two numbers: 12 18
LCM = 36
*/
/*
    Question: Swap using Pass by Reference

    Problem:
    Create a function to swap two numbers using pass by reference.

    Approach:
    - Create swapNumbers() function
    - Use reference variables
    - Swap values directly
*/

#include <bits/stdc++.h>
using namespace std;

void swapNumbers(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int a, b;

    cout << "Enter first number: ";
    cin >> a;

    cout << "Enter second number: ";
    cin >> b;

    cout << "Before swapping:" << endl;
    cout << "First number: " << a << endl;
    cout << "Second number: " << b << endl;

    swapNumbers(a, b);

    cout << "After swapping:" << endl;
    cout << "First number: " << a << endl;
    cout << "Second number: " << b << endl;

    return 0;
}

/*
Sample Input:
10
20

Sample Output:
Before swapping:
First number: 10
Second number: 20
After swapping:
First number: 20
Second number: 10
*/
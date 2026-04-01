/*
    Question: Swap Two Numbers (Without Third Variable)

    Problem:
    Take two numbers as input and swap their values without using a third variable.

    Approach:
    - Read two integers from input
    - Use addition and subtraction to swap values
    - Print swapped values
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    a = a + b;
    b = a - b;
    a = a - b;

    cout << "After swapping, first number is: " << a << endl;
    cout << "After swapping, second number is: " << b << endl;

    return 0;
}

/*
Sample Input:
10 20

Sample Output:
After swapping, first number is: 20
After swapping, second number is: 10
*/
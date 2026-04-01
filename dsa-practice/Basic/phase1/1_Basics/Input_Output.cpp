/*
    Question: Input Output

    Problem:
    Take two numbers and print all operations ( + - * / %) on them.

    Approach:
    - Read two integers from input
    - Perform all five arithmetic operations
    - Print the results
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b ;

        cout << "The sum of given numbers is: " << a + b << endl;
        cout << "The difference of given numbers is: " << a - b << endl;
        cout << "The product of given numbers is: " << a * b << endl;
        cout << "The quotient of given numbers is: " << a / b << endl;
        cout << "The remainder of given numbers is: " << a % b << endl;

    return 0;
}

/*
Sample Input:
10 5

Sample Output:
The sum of given numbers is: 15
The difference of given numbers is: 5
The product of given numbers is: 50
The quotient of given numbers is: 2
The remainder of given numbers is: 0
*/
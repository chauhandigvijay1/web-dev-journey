/*
    Question: Max of 3 Numbers using Function

    Problem:
    Return the largest among three numbers using a function.

    Approach:
    - Create a function maxOfThree()
    - Compare three numbers
    - Return the largest
*/

#include <bits/stdc++.h>
using namespace std;

int maxOfThree(int a, int b, int c) {
    if(a >= b && a >= c)
        return a;
    else if(b >= a && b >= c)
        return b;
    else
        return c;
}

int main() {
    int a, b, c;

    cout << "Enter first number: ";
    cin >> a;

    cout << "Enter second number: ";
    cin >> b;

    cout << "Enter third number: ";
    cin >> c;

    cout << "The largest number is: " << maxOfThree(a, b, c) << endl;

    return 0;
}

/*
Sample Input:
10
25
15

Sample Output:
The largest number is: 25
*/
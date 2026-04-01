/*
    Question: Table of a Number

    Problem:
    Print multiplication table of a given number.

    Approach:
    - Read number
    - Use loop from 1 to 10
    - Multiply and print
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout<<"Enter a number of which multiplication is to be performed:";
    cin >> n;

    for(int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << endl;
    }

    return 0;
}

/*
Sample Input:
5

Sample Output:
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
...
*/
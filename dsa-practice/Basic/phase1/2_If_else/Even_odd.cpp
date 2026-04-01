/*
    Question: Even or Odd

    Problem:
    Check whether a number is even or odd.

    Approach:
    - Read integer
    - If number % 2 == 0 → even
    - Else → odd
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout << "Enter a number: ";
    cin >> n;

    if(n % 2 == 0)
        cout << "Even";
    else
        cout << "Odd";

    return 0;
}

/*
Sample Input:
4

Sample Output:
Even
*/
/*
    Question: Reverse a Number

    Problem:
    Reverse a given number.

    Approach:
    - Extract last digit using % 10
    - Add digit to reversed number
    - Remove last digit using / 10
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, rev = 0;
    cout<<"Enter number:";
    cin >> n;

    while(n > 0) {
        int digit = n % 10;
        rev = rev * 10 + digit;
        n = n / 10;
    }

    cout << "Reversed Number: " << rev;

    return 0;
}

/*
Sample Input:
1234

Sample Output:
Reversed Number: 4321
*/
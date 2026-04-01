/*
    Question: Sum of Digits

    Problem:
    Find sum of digits of a number.

    Approach:
    - Extract last digit using % 10
    - Add it to sum
    - Remove last digit using / 10
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, sum = 0;
    cout<<"Enter number:";
    cin >> n;

    while(n > 0) {
        int digit = n % 10;
        sum += digit;
        n = n / 10;
    }

    cout << "Sum of Digits: " << sum;

    return 0;
}

/*
Sample Input:
1234

Sample Output:
Sum of Digits: 10
*/
/*
    Question: Count Digits of a Number

    Problem:
    Given an integer n, count how many digits are present in the number.

    Approach:
    - Repeatedly divide the number by 10
    - Count how many times division happens
    - Special case: if number is 0, digits = 1
*/

#include <bits/stdc++.h>
using namespace std;

// Function to count digits
int countDigits(int n) {
    if(n == 0) return 1;

    n = abs(n);
    int count = 0;

    while(n > 0) {
        count++;
        n /= 10;
    }

    return count;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    cout << "Total digits: " << countDigits(n) << endl;

    return 0;
}
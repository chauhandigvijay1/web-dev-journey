/*
    Question: Count Digits

    Problem:
    Count total digits in a number.

    Approach:
    - Special case: if number is 0, count = 1
    - Else keep dividing by 10
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, count = 0;
    cin >> n;

    if(n == 0) {
        count = 1;
    } else {
        while(n > 0) {
            count++;
            n = n / 10;
        }
    }

    cout << "Total Digits: " << count;

    return 0;
}
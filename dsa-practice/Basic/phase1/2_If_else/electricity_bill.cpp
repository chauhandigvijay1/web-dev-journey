/*
    Question: Electricity Bill

    Problem:
    Calculate bill based on units.

    Approach:
    - Use slab system
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int units;
    float bill;
    cout << "Enter units consumed: ";
    cin >> units;

    if(units <= 100)
        bill = units * 1.5;
    else if(units <= 200)
        bill = 100*1.5 + (units-100)*2;
    else
        bill = 100*1.5 + 100*2 + (units-200)*3;

    cout << "Bill: " << bill;

    return 0;
}
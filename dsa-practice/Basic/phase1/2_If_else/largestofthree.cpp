/*
    Question: Largest of 3 Numbers

    Problem:
    Find the greatest among three numbers.

    Approach:
    - Compare all three using if-else
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int a, b, c;
    cout << "Enter three numbers: ";
    cin >> a >> b >> c;

    if(a >= b && a >= c)
        cout << "Largest: " << a;
    else if(b >= a && b >= c)
        cout << "Largest: " << b;
    else
        cout << "Largest: " << c;

    return 0;
}
/*
    Question: Valid Triangle and Type

    Problem:
    Check if triangle is valid and determine its type.

    Approach:
    - Valid if sum of any two sides > third
    - If all equal → Equilateral
    - If two equal → Isosceles
    - Else → Scalene
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int a, b, c;
    cout<< "Enter three sides of triangle: ";
    cin >> a >> b >> c;

    if(a+b>c && a+c>b && b+c>a) {
        cout << "Valid Triangle\n";

        if(a==b && b==c)
            cout << "Equilateral";
        else if(a==b || b==c || a==c)
            cout << "Isosceles";
        else
            cout << "Scalene";
    }
    else {
        cout << "Invalid Triangle";
    }

    return 0;
}
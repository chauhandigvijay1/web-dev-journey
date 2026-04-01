/*
    Question: Leap Year

    Problem:
    Check if a year is a leap year.

    Rules:
    - Divisible by 400 → leap
    - Divisible by 4 and not by 100 → leap
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int year;
    cout<< "Enter a year: ";
    cin >> year;

    if((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0))
        cout << "Leap Year";
    else
        cout << "Not a Leap Year";

    return 0;
}
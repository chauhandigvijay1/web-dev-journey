/*
    Question: Grade System

    Problem:
    Assign grade based on marks.

    Approach:
    - Use range conditions
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int marks;
    cout<< "Enter marks: ";
    cin >> marks;

    if(marks >= 90)
        cout << "A";
    else if(marks >= 80)
        cout << "B";
    else if(marks >= 70)
        cout << "C";
    else if(marks >= 60)
        cout << "D";
    else
        cout << "Fail";

    return 0;
}
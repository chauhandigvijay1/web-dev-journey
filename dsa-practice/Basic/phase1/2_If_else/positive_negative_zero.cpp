/*
    Question: Positive / Negative / Zero

    Problem:
    Classify a number as positive, negative, or zero.

    Approach:
    - If n > 0 → positive
    - If n < 0 → negative
    - Else → zero
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout<< "Enter a number: ";
    cin >> n;

    if(n > 0)
        cout << "Positive";
    else if(n < 0)
        cout << "Negative";
    else
        cout << "Zero";

    return 0;
}
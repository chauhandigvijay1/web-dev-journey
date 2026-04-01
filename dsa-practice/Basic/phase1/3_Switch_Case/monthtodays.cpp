/*
    Question: Month to Number of Days

    Problem:
    Input month number and print total days in that month.

    Approach:
    - Read month number
    - Use switch case
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int month;
    cout<<"Enter month '1-12':";
    cin >> month;

    switch(month) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            cout << "31 days";
            break;
        case 4: case 6: case 9: case 11:
            cout << "30 days";
            break;
        case 2:
            cout << "28 or 29 days";
            break;
        default:
            cout << "Invalid month number";
    }

    return 0;
}

/*
Sample Input:
2

Sample Output:
28 or 29 days
*/
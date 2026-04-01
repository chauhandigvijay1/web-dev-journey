/*
    Question: Menu-Driven Program

    Problem:
    Create a menu-driven program with options:
    1. Add
    2. Subtract
    3. Multiply
    4. Exit

    Approach:
    - Read user choice
    - Perform operation based on choice
    - Exit if user selects 4
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int choice, a, b;

    cout << "1. Add" << endl;
    cout << "2. Subtract" << endl;
    cout << "3. Multiply" << endl;
    cout << "4. Exit" << endl;

    cin >> choice;

    switch(choice) {
        case 1:
            cout<<"Enter two numbers to be added:";
            cin >> a >> b;
            cout << "Result: " << a + b;
            break;
        case 2:
            cout<<"Enter two numbers to be subtracted:";
            cin >> a >> b;
            cout << "Result: " << a - b;
            break;
        case 3:
            cout<<"Enter two numbers to be multiplied:";
            cin >> a >> b;
            cout << "Result: " << a * b;
            break;
        case 4:
            cout << "Exiting Program...";
            break;
        default:
            cout << "Invalid choice";
    }

    return 0;
}

/*
Sample Input:
1
10 5

Sample Output:
Result: 15
*/
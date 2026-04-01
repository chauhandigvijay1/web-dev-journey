/*
    Question: Menu Driven Calculator

    Problem:
    Create a calculator using:
    - loops
    - switch case
    - functions

    Features:
    1. Addition
    2. Subtraction
    3. Multiplication
    4. Division
    5. Modulus
    6. Exit

    Approach:
    - Create separate functions for each operation
    - Use switch case for menu options
    - Use while loop to keep calculator running until Exit
*/

#include <bits/stdc++.h>
using namespace std;

// Function for Addition
int add(int a, int b) {
    return a + b;
}

// Function for Subtraction
int subtract(int a, int b) {
    return a - b;
}

// Function for Multiplication
int multiply(int a, int b) {
    return a * b;
}

// Function for Division
float divide(int a, int b) {
    return (float)a / b;
}

// Function for Modulus
int modulus(int a, int b) {
    return a % b;
}

int main() {
    int choice, a, b;

    while(true) {
        cout << "\n========== MENU DRIVEN CALCULATOR ==========" << endl;
        cout << "1. Addition" << endl;
        cout << "2. Subtraction" << endl;
        cout << "3. Multiplication" << endl;
        cout << "4. Division" << endl;
        cout << "5. Modulus" << endl;
        cout << "6. Exit" << endl;
        cout << "============================================" << endl;

        cout << "Enter your choice: ";
        cin >> choice;

        if(choice == 6) {
            cout << "Exiting Calculator..." << endl;
            break;
        }

        if(choice >= 1 && choice <= 5) {
            cout << "Enter first number: ";
            cin >> a;

            cout << "Enter second number: ";
            cin >> b;
        }

        switch(choice) {
            case 1:
                cout << "Result: " << add(a, b) << endl;
                break;

            case 2:
                cout << "Result: " << subtract(a, b) << endl;
                break;

            case 3:
                cout << "Result: " << multiply(a, b) << endl;
                break;

            case 4:
                if(b == 0) {
                    cout << "Division by zero is not allowed." << endl;
                } else {
                    cout << "Result: " << divide(a, b) << endl;
                }
                break;

            case 5:
                if(b == 0) {
                    cout << "Modulus by zero is not allowed." << endl;
                } else {
                    cout << "Result: " << (a%b) << endl;
                }
                break;

            case 6:
                break;

            default:
                cout << "Invalid choice! Please enter a valid option." << endl;
        }
    }

    return 0;
}

/*
Sample Output:

========== MENU DRIVEN CALCULATOR ==========
1. Addition
2. Subtraction
3. Multiplication
4. Division
5. Modulus
6. Exit
============================================
Enter your choice: 1
Enter first number: 10
Enter second number: 5
Result: 15

Enter your choice: 4
Enter first number: 20
Enter second number: 4
Result: 5

Enter your choice: 6
Exiting Calculator...
*/
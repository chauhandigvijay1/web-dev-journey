/*
    Question: Mini ATM System

    Problem:
    Create a mini ATM system with options:
    1. Check Balance
    2. Deposit
    3. Withdraw
    4. Exit

    Approach:
    - Use switch case, loops, functions, and conditions
*/

#include <bits/stdc++.h>
using namespace std;

void checkBalance(float balance) {
    cout << "Current Balance: Rs. " << balance << endl;
}

float deposit(float balance, float amount) {
    balance += amount;
    cout << "Amount Deposited Successfully." << endl;
    return balance;
}

float withdraw(float balance, float amount) {
    if(amount > balance) {
        cout << "Insufficient Balance." << endl;
    } else {
        balance -= amount;
        cout << "Amount Withdrawn Successfully." << endl;
    }
    return balance;
}

int main() {
    int choice;
    float balance = 1000, amount;

    while(true) {
        cout << "\n===== MINI ATM SYSTEM =====" << endl;
        cout << "1. Check Balance" << endl;
        cout << "2. Deposit" << endl;
        cout << "3. Withdraw" << endl;
        cout << "4. Exit" << endl;

        cout << "Enter your choice: ";
        cin >> choice;

        switch(choice) {
            case 1:
                checkBalance(balance);
                break;
            case 2:
                cout << "Enter amount to deposit: ";
                cin >> amount;
                balance = deposit(balance, amount);
                break;
            case 3:
                cout << "Enter amount to withdraw: ";
                cin >> amount;
                balance = withdraw(balance, amount);
                break;
            case 4:
                cout << "Thank you for using ATM. Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice. Please try again." << endl;
        }
    }

    return 0;
}
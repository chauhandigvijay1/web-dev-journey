/*
    Question: Calculator using switch

    Problem:
    Take two numbers and an operator (+, -, *, /, %) as input
    and perform the corresponding operation using switch case.

    Approach:
    - Read two numbers
    - Read operator
    - Use switch to perform operation
    - Print result
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int a, b;
    char op;

    cout << "Enter two numbers : ";
    cin >> a >> b ;
    cout << "Enter operator (+, -, *, /, %): ";
    cin >> op;

    switch(op) {
        case '+':
            cout << "Result: " << a + b;
            break;
        case '-':
            cout << "Result: " << a - b;
            break;
        case '*':
            cout << "Result: " << a * b;
            break;
        case '/':
            if(b != 0)
                cout << "Result: " << a / b;
            else
                cout << "Division by zero is not allowed";
            break;
        case '%':
            if(b != 0)
                cout << "Result: " << a % b;
            else
                cout << "Modulo by zero is not allowed";
            break;
        default:
            cout << "Invalid operator";
    }

    return 0;
}

/*
Sample Input:
10 5 +

Sample Output:
Result: 15
*/
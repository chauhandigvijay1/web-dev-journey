/*
    Question: Armstrong Number

    Problem:
    Check whether a number is an Armstrong number or not.
    An Armstrong number is a number where sum of each digit raised
    to the power of total digits is equal to the number itself.

    Example:
    153 = 1^3 + 5^3 + 3^3

    Approach:
    - Count total digits
    - Extract each digit
    - Add digit^count to sum
    - Compare sum with original number
*/

#include <bits/stdc++.h>
using namespace std;

// Function to count digits
int countDigits(int n) {
    if(n == 0) return 1;

    int count = 0;
    n = abs(n);

    while(n > 0) {
        count++;
        n = n / 10;
    }

    return count;
}

// Function to check Armstrong number
bool isArmstrong(int n) {
    int original = n;
    n = abs(n);

    int digits = countDigits(n);
    int sum = 0, temp = n;

    while(temp > 0) {
        int digit = temp % 10;
        sum += pow(digit, digits);
        temp = temp / 10;
    }

    return sum == n;
}

int main() {
    int n;

    cout << "Enter a number: ";
    cin >> n;

    if(isArmstrong(n)) {
        cout << n << " is an Armstrong Number." << endl;
    } 
    else {
        cout << n << " is NOT an Armstrong Number." << endl;
    }

    return 0;
}

/*
Sample Output:
Enter a number: 153
153 is an Armstrong Number.
*/
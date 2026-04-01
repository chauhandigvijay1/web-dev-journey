/*
    Question: Prime Number (Basic)

    Problem:
    Check if a number is prime.

    Approach:
    - A number is prime if divisible only by 1 and itself
    - Check divisibility from 2 to n-1
*/

#include <iostream>
using namespace std;

int main() {
    int a;
    cout << "Enter a number: ";
    cin >> a;
    if(a<2)
    {
            cout<<"Not a prime no.";
    }
    for(int i=2;i<a;i++)
    {
        if(a%i==0)
        {
            cout<<"Not a prime no.";
            return 0;
        }
    }
    cout<<"Prime no.";

    return 0;
}
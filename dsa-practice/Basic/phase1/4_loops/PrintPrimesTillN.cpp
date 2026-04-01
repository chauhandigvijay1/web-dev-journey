/*
    Question: Print Primes Till N

    Problem:
    Print all prime numbers from 1 to N.

    Approach:
    - For each number from 2 to N
    - Check if it is prime
    - If yes, print it
*/

#include<bits/stdc++.h>
using namespace std;

int isprime(int num) 
{
    if(num<2)
    return 0;
    for(int i=2; i<=num-1; i++) {
        if(num%i==0)
        return 0;
    }
    return 1;
}

int main() {
    int num;
    cout<<"Enter a number : ";
    cin >> num;
    cout << "Prime numbers till " << num << " are: ";
    for(int i=2; i<=num-1; i++)
    {
        if(isprime(i))
        {
            cout<<i<<endl;
        }
    }
    return 0;
}
/*
    Question: Check Prime

    Problem:
    Check whether a number is prime using loop.

    Approach:
    - A prime number has exactly two factors: 1 and itself
    - Check divisibility from 2 to n-1
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int num;
    cout<<"Enter a number : ";
    cin>>num;
    if(num<2)
    {
        cout<<"Not Prime";
        return 0;
    }
    for(int i=2; i<=num-1; i++)
    {
        if(num%i==0)
        {
            cout<<"Not Prime";
            return 0;
        }
    }
    cout<<"Prime";

}
/*
    Question: Sum of N Numbers

    Problem:
    Find sum from 1 to N.

    Approach:
    - Read N
    - Use loop to add numbers from 1 to N
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, sum = 0;
    cout<<"Enter number:";
    cin >> n;

    for(int i = 1; i <= n; i++) {
        sum += i;
    }

    cout << "Sum: " << sum;

    return 0;
}

/*
Sample Input:
5

Sample Output:
Sum: 15
*/
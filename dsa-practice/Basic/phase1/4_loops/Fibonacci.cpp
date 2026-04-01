/*
    Question: Fibonacci Series

    Problem:
    Print Fibonacci series till N terms.

    Approach:
    - Start with 0 and 1
    - Next term = sum of previous two
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout<<"Enter number of terms:";
    cin >> n;

    int a = 0, b = 1;

    for(int i = 1; i <= n; i++) {
        cout << a << " ";
        int next = a + b;
        a = b;
        b = next;
    }

    return 0;
}

/*
Sample Input:
7

Sample Output:
0 1 1 2 3 5 8
*/
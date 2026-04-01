/*
    Question: Print 1 to N

    Problem:
    Print numbers from 1 to N.

    Approach:
    - Read N
    - Use loop from 1 to N
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cout<<"Enter a number:";
    cin >> n;

    for(int i = 1; i <= n; i++) {
        cout << i << " ";
    }

    return 0;
}

/*
Sample Input:
5

Sample Output:
1 2 3 4 5
*/
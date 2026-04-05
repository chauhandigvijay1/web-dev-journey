/*
    Question: Pattern 8 - Inverted Pyramid Star Pattern

    Problem:
    Print an inverted centered pyramid star pattern.

    Example for n = 5:
    *********
     *******
      *****
       ***
        *

    Approach:
    - First print spaces
    - Then print stars
    - Spaces increase every row
    - Stars decrease every row
*/

#include <bits/stdc++.h>
using namespace std;

// Function to print pattern
void printPattern(int n) {
    for(int i = 1; i <= n; i++) {
        // Print spaces
        for(int j = 1; j <= i - 1; j++) {
            cout << " ";
        }

        // Print stars
        for(int j = 1; j <= 2 * (n - i) + 1; j++) {
            cout << "*";
        }

        cout << endl;
    }
}

int main() {
    int n;

    cout << "Enter number of rows: ";
    cin >> n;

    printPattern(n);

    return 0;
}

/*
Sample Output:
Enter number of rows: 5
*********
 *******
  *****
   ***
    *
*/
/*
    Question: Temperature Conversion (Celsius to Fahrenheit)

    Problem:
    Take temperature in Celsius and convert it to Fahrenheit.

    Approach:
    - Read temperature in Celsius
    - Use formula: F = (C * 9/5) + 32
    - Print the Fahrenheit value
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    float celsius, fahrenheit;
    cin >> celsius;

    fahrenheit = (celsius * 9 / 5) + 32;

    cout << "Temperature in Fahrenheit is: " << fahrenheit << endl;

    return 0;
}

/*
Sample Input:
25

Sample Output:
Temperature in Fahrenheit is: 77
*/
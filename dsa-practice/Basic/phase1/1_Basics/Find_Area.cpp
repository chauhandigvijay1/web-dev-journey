/*
    Question: Area of Circle

    Problem:
    Take radius of a circle as input and find its area.

    Approach:
    - Read radius from input
    - Use formula: Area = pi * r * r
    - Print the area
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    float radius, area;
    cin >> radius;

    area = 3.14159 * radius * radius;

    cout << "The area of the circle is: " << area << endl;

    return 0;
}

/*
Sample Input:
7

Sample Output:
The area of the circle is: 153.938
*/
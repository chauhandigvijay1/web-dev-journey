/*
    Question: Convert Seconds

    Problem:
    Take total seconds as input and convert it into hours, minutes, and seconds.

    Approach:
    - Read total seconds from input
    - Find hours by dividing by 3600
    - Find remaivalue will be seconds
    - Print ning seconds
    - Find minutes by dividing remaining seconds by 60
    - Remaining hours, minutes, and seconds
*/

#include<bits/stdc++.h>
using namespace std;

int main() {
    int totalSeconds, hours, minutes, seconds;
    cin >> totalSeconds;

    hours = totalSeconds / 3600;
    totalSeconds = totalSeconds % 3600;

    minutes = totalSeconds / 60;
    seconds = totalSeconds % 60;

    cout << "Hours: " << hours << endl;
    cout << "Minutes: " << minutes << endl;
    cout << "Seconds: " << seconds << endl;

    return 0;
}

/*
Sample Input:
3665

Sample Output:
Hours: 1
Minutes: 1
Seconds: 5
*/
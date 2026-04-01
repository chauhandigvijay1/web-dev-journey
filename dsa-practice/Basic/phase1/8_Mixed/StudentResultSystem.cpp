/*
    Question: Student Result System

    Problem:
    Input marks of students and calculate:
    - Total
    - Average
    - Grade
    - Pass / Fail

    Approach:
    - Store marks in array
    - Calculate total and average
    - Use if-else for grade and result
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    int marks[5], total = 0;
    float average;

    cout << "Enter marks of 5 subjects:" << endl;

    for(int i = 0; i < 5; i++) {
        cout << "Enter marks of subject " << i + 1 << ": ";
        cin >> marks[i];
        total += marks[i];
    }

    average = total / 5.0;

    cout << "\n===== STUDENT RESULT =====" << endl;
    cout << "Total Marks: " << total << endl;
    cout << "Average Marks: " << average << endl;

    if(average >= 90)
        cout << "Grade: A" << endl;
    else if(average >= 80)
        cout << "Grade: B" << endl;
    else if(average >= 70)
        cout << "Grade: C" << endl;
    else if(average >= 60)
        cout << "Grade: D" << endl;
    else
        cout << "Grade: Fail" << endl;

    bool pass = true;
    for(int i = 0; i < 5; i++) {
        if(marks[i] < 33) {
            pass = false;
            break;
        }
    }

    if(pass)
        cout << "Result: Pass" << endl;
    else
        cout << "Result: Fail" << endl;

    return 0;
}
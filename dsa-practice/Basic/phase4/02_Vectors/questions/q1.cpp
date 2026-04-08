/*
Question:
- Take input in vector and print it

Approach / Logic:
- Create an empty vector
- Take size n as input
- Input all elements using loop
- Print all elements using loop

Time Complexity: O(n)
Space Complexity: O(n)

Pattern:
- Vector Basics

Mistake / Note:
- Vector indexing starts from 0
*/

#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int>v;
    cout << "Enter the size of the vector: ";
    int n;
    cin >> n;
    cout << "Enter the elements of the vector: ";
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        v.push_back(x);
    }
    cout << "The elements of the vector are: ";
    for (int i = 0; i < n; i++) {
        cout << v[i] << " ";
    }
    return 0;
}
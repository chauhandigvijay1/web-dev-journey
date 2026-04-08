#include <bits/stdc++.h>
using namespace std;

int main() {

    int n;
    cout << "Enter size: ";
    cin >> n;

    int arr[n];   // (Works in GCC, but not standard C++)

    cout << "Enter elements:\n";
    for (int i = 0; i < n; i++) {
        cout << "Enter " << i + 1 << " value: ";
        cin >> arr[i];
    }

    set<int> s;

    for (int i = 0; i < n; i++) {
        s.insert(arr[i]);
    }

  
    cout<<"Distinct elements in array is: "<<s.size();

    

    return 0;
}
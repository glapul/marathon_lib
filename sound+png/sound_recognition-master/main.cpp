#include<cstdio>
#include<vector>
#include<cmath>
#include "wav.h"
#include "compute.h"
using namespace std;

int main()
{
	wav Plik("test2.wav");
    vector<vector<double> > tmp = compute(Plik.Trans); // to jest ten vector vectorów który masz wyswietlic

    // to jest zamiast wyswietlania pisanie na konsolę, pozniej wywalic
    for(int i=0;i<tmp.size();i++)
    {
        for(int j=0;j<tmp[i].size();j++)
            printf("%lf ",tmp[i][j]);
        printf("\n");
    }


}

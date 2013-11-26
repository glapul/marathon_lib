#ifndef compute_h
#define compute_h
#include <complex>
#include <vector>
using namespace std;

struct FFT
{
    vector<complex<double> > org, res, tmp,e;
    int n;
    vector<complex<double> > compute_inverse( vector<complex<double> > x);
    vector<complex<double> > poly_mult(vector<complex<double> > u, vector<complex < double > > v);
    vector<complex<double> > compute( vector<complex<double> > x);
    void fft(int l, int p=0,int s=1,int q=0);
};
vector<double> transform (vector<double> t);
vector<vector<double> > compute(vector<double> sound);
#endif

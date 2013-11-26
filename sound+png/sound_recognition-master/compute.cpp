#include "compute.h"
#include<vector>
#include<cmath>
#include<complex>
using namespace std;
const int SMPLS_PR_BLCK = 1<<15; // rozmiar fragmentu, ktorego FFT liczymy - 2^15 to okolo 0.8s
const int SMLL_BLCK = 1<<9; //rozmiar wynikowego vectora z FFT tych 0.8s
const  double INF= 2000000000;
vector<complex<double> > FFT::compute_inverse( vector<complex<double> > x)
{
    // x's length must be a power of 2
    org=x;
    n=x.size();
    res =vector<complex<double > > (n);
    tmp =vector<complex<double > > (n);
    e =vector<complex<double > > (n);
    for (int i=0;i<n;i++)
        e[i] = exp((2*M_PI*i*complex<double> (0,1))/(double)n);
    fft(n);
    for(int i=0;i<n;i++)
        res[i]/=n;
    return res;
}
vector<complex<double> > FFT::poly_mult(vector<complex<double> > u, vector<complex < double > > v)
{
    int s = u.size()+v.size();
    u.resize(s);
    v.resize(s);
    while((((int)u.size())&((-(int)u.size()))) != (int)u.size())
    {
        u.push_back(0);
        v.push_back(0);
    }
    vector<complex<double> > dftu = compute(u), dftv = compute(v),res;
    for(int i=0;i<(int)dftu.size();i++)
        res.push_back(dftu[i]*dftv[i]);
    return compute_inverse(res);
}
vector<complex<double> > FFT::compute( vector<complex<double> > x)
{
    // x's length must be a power of 2
    org=x;
    n=x.size();
    res =vector<complex<double > > (n);
    tmp =vector<complex<double > > (n);
    e =vector<complex<double > > (n);
    for (int i=0;i<n;i++)
        e[i] = exp(-(2*M_PI*i*complex<double> (0,1))/(double)n);
    fft(n);
    return res;
}

void FFT::fft(int l, int p,int s,int q)
{
    if(l==1)
    {
        res[q]=org[p];
        return;
    }
    int pt = 0;
    fft(l/2,p,2*s,q);
    fft(l/2,p+s,2*s,q+l/2);
    for(int i=0;i<l/2;i++)
    {
        tmp[i] = res[q+i]+e[pt]*res[q+l/2+i];
        tmp[i+l/2] = res[q+i] - e[pt]*res[q+l/2+i];
        pt+=s;
        pt%=n;
    }
    for(int i=0;i<l;i++)
        res[q+i]=tmp[i];
}

vector<double> transform (vector<double> t)
{
    int div = SMPLS_PR_BLCK/SMLL_BLCK;
    vector<double> res;
    for(int i=0;i<t.size();i+=div)
    {
        double tmp = 0;
        for(int j=0;j<div && i+j < t.size();j++)
            if(t[i+j] > tmp)
                tmp += t[i+j];
        res.push_back(tmp);
    }
    for(int i=0;i<res.size();i++)
        if(res[i]<0)
            res[i]*=-1;
    double mx=0;
    for(int i=0;i<res.size();i++)
        mx = max(mx,res[i]);
    for(int i=0;i<res.size();i++)
        res[i]*=100.0/mx;
    return res;
}

vector<vector<double> > compute(vector<double> sound)
{
    FFT fft;
    vector<vector<double> > res;
    vector<complex<double> > tmp;
    while(sound.size()%SMPLS_PR_BLCK)
        sound.push_back(0);
    for(int i=0;i<sound.size();i+=SMPLS_PR_BLCK)
    {
        vector<complex<double> > t;
        for(int j=0;j<SMPLS_PR_BLCK;j++)
            t.push_back(complex<double>(sound[i+j],0));
        tmp = fft.compute(t);
        vector<double> tmp2;
        for(int i=0;i<tmp.size();i++)
            tmp2.push_back(tmp[i].real());
        res.push_back(transform(tmp2));
    }
    return res;
}

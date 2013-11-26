#ifndef wav_h
#define wav_h

#include <fstream>
#include <vector>
#include <iostream>
#include <string>
#include<algorithm>
using namespace std;

struct wav{
	fstream file;
	vector<double> Trans;

	wav(string fileName);
	void load(string fileName);
	void translate();

	long long ReadIntValue(int bytes);
	string ReadCharValue(int bytes);

	long long bin2dec(string Bin);
	string dec2bin(int Dec);

};

#endif

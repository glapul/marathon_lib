/////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
#include<cstdio>
#include<string>
#include<sstream>
#include<iostream>
#include<vector>
#include<algorithm>
#include "CTcpFwd.h"
using namespace std;
#define FOREACH(i,c) for(__typeof((c).begin()) i = (c).begin();i!=(c).end();i++)
#define pb push_back
#define mp make_pair


CTcpFwd *Sock;
string errors[1000];
int curr_round, curr_turn, all_turns;
//Dopiszcie tutaj errory waszego zadania
void init()
{
    errors[1]="Incorrect login or password.";
    errors[2]="Command too long.";
    errors[3]="Unknown command name.";
    errors[4]="Wrong number of arguments.";
    errors[5]="Invalid syntax of arguments.";
    errors[6]="Commands limit reached.";
    errors[7]="Commands limit reached, forcing waiting.";
    errors[8]="Internal server error.";
    errors[9]="No current round.";
    errors[444]="Logging in failed. Consider terminating the program";
}
long long stoi(string x)
{
    long long value;
    istringstream(x) >>value;
    return value;
}
vector<string> split(string x, char splitter= ' ')
{
    vector<string> res;
    string tmp;
    x+=splitter;
    for(int i=0;i<x.size();i++)
    {
        if(x[i]!=splitter)
            tmp+=x[i];
        else
        {
            if(tmp!="")
                res.push_back(tmp);
            tmp="";
        }
    }
    return res;
}
void wait()
{
    cout << "WAIT\n";
    string x;
    getline(cin,x);
    if(x!="OK")
    {
        vector<string> ss = split(x);
        throw(mp(stoi(ss[1]),errors[stoi(ss[1])]));
    }
    cerr << "waiting\n";
    getline(cin,x);
    getline(cin,x);
    cerr << "done\n";

}
string kto_idzie_po_zarcie()
{
    return "kaszuba";
}
int pachocki_debiak_cygan_place()
{
    return 1;
}
void connect(string ADDRESS, int PORT, string LOGIN, string PASSWORD)
{
    char buff[50];
    cerr << "Estabilishing connection\n";
    Sock = new CTcpFwd("task",ADDRESS.c_str(),PORT);
    string wtf;
    scanf("%s",buff);
    for(int i=0;i< strlen(buff);i++)
        cerr << buff[i];
    cerr<<endl;
    getline(cin,wtf);
    cerr << "DBG:" <<wtf<<endl;
    if(wtf!= "LOGIN")
        throw(mp(444,errors[444]));
    cout << LOGIN << "\n";
    cin >>wtf;
    if(wtf!="PASSWORD")
        throw(mp(444,errors[444]));
    cout<<PASSWORD<<"\n";
    cin >> wtf;
    if(wtf!="OK")
        throw(mp(444,errors[444]));
    cerr << "Logged in succesfully\n";
}
void send_message(string x)
{
    try
    {
        cout <<x;
        string tmp;
        getline(cin,tmp);
        if(tmp!="OK")
        {
            vector<string> ss = split(tmp);
            throw(mp(stoi(ss[1]),errors[stoi(ss[1])]));
        }
    }
    catch(pair<int, string> e)
    {
        switch(e.first)
        {
            case 6 :    wait();
                        send_message(x);
                        break;
            case 7 :    send_message(x);
                        break;
            default:    throw(e);
                        break;

        }
    }
}
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
int main()
{
    connect("localhost",1234,"glapul","zlerocta");
    send_message("Zwykla wiadomosc");
    send_message("Teraz rzuc errorem 6");
}

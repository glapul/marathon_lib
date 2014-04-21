
/////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
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
    errors[10]="No more bonuses to find";
    errors[101] = "Not suff. money to process recruitment";
    errors[444]="Logging in failed. Consider terminating the program";
}
vector<vector<int> > parsuj(vector<vector<string> > p)
{
    vector<vector<int > > res;
    for(int i=0;i<p.size();i++)
    {
        vector<int> tmp;
        FOREACH(j,p[i])
            tmp.pb(stoi(*j));
        res.pb(tmp);
    }
    return res;
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
void connect(string ADDRESS, int PORT, string LOGIN, string PASSWORD)
{
    init();
    cerr << "Estabilishing connection\n";
    Sock = new CTcpFwd("task",ADDRESS.c_str(),PORT);
    Sock->SwitchStdout("task");
    Sock->SwitchStdin("task");
    string wtf;
    getline(cin,wtf);
    if(wtf!= "LOGIN")
        throw(mp(444,errors[444]));
    cout << LOGIN << "\n";
    getline(cin,wtf);
    if(wtf!="PASSWORD")
        throw(mp(444,errors[444]));
    cout<<PASSWORD<<"\n";
    getline(cin,wtf);
    if(wtf!="OK")
        throw(mp(444,errors[444]));
    cerr << "Logged in succesfully\n";
}
void send_message(string x)
{
    try
    {
        cout <<x<<endl;
        string tmp;
        getline(cin,tmp);
        cerr<<x<<endl;
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
vector<string> get_message(int lines=1)
{
    vector<string> ans;
    for(int i=0;i<lines;i++)
    {
        string tmp;
        getline(cin,tmp);
        ans.pb(tmp);
    }
    return ans;
}
vector<vector<string> > get_message_and_split(int lines=1)
{
    vector<string> bef = get_message(lines);
    vector<vector<string> > res;
    for(auto & i : bef)
        res.pb(split(i));
    return res;
}
vector<string> send_message_get_response(string msg,int lines=1)
{
    send_message(msg);
    return get_message(lines);
}
vector<vector<string> > send_message_get_response_and_split(string msg,int lines=1)
{
    send_message(msg);
    return get_message_and_split(lines);
}
vector<int> get_time_raw()
{
    vector<vector<string> > ans = send_message_get_response_and_split("GET_TIME");
    vector<int> res;
    for(auto &i : ans[0])
        res.push_back(stoi(i));
    curr_round=res[0];
    curr_turn = res[1];
    all_turns=res[2];
    return res;
}
int get_round_number()
{
    get_time_raw();
    return curr_round;
}
int get_current_turn()
{
    get_time_raw();
    return curr_turn;
}
int get_turns_till_end()
{
    get_time_raw();
    return all_turns- curr_turn+1;
}
int get_all_turns()
{
    get_time_raw();
    return all_turns;
}
double get_my_score()
{
    return stod(send_message_get_response((string)"GET_MY_SCORE")[0]);
}
vector<double> get_all_scores()
{
   vector<vector<string> > ans = send_message_get_response_and_split("GET_ALL_SCORES",2);
   int n = stoi(ans[0][0]);
   vector<double> scores;
   for(int i=0;i<n;i++)
       scores.pb(stod(ans[1][i]));
   return scores;
}
int get_my_place()
{
    vector<double> scores = get_all_scores();
    reverse(scores.begin(),scores.end());
    double my = get_my_score();
    return scores.end()-upper_bound(scores.begin(),scores.end(),my)+1;
}

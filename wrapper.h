/*
 * Biblioteczka na marathon
 * ========================
 *
 * Należy pisać program grający DOKŁADNIE JEDNĄ rundę. Gdy biblioteczka wykryje że runda się skończyła, rzuci wyjątek (666,"round terminated").
 * Teoretycznie można go łapać i zaczynać rozwiązywać nową rundę w tym samym programie, ale polecam po prostu go puścić, pozwolić programowi się wyjebać,
 * a całość uruchamiać jeszcze raz pętlą w bashu (skrypt runner.sh).
 *
 * Różne wolne przemyślenia:
 * - kompilować z c++11 (g++ -std=c++0x ...)
 * - dobrze żeby programy, które piszecie były przygotowane na to, że jakieś ruchy zostały już wykonane przed uruchomieniem. Pozwoli to uratować sporo punktów,
 *   gdy program się wyjebie, wywali się połączenie z netem, padnie lapek etc.
 * - ta biblioteczka zakłada że używamy stringów.
 * - komunikacja z serwerem przebiega w ten sposób, że STDIN i STDOUT są na komunikację z serwerem. Wobec tego teoretycznie możecie uzywać po prostu cin i cout,
 *   ale lepiej uzywajcie funkcji send_message(), get_message() a najlepiej send_message_get_response() - rozpatrują one kilka dziwnych przypadków,
 *   a jesli cos się będzie sypać w trakcie kontestu będzie można to szybko naprawić zmieniając tylko kod biblioteczki
 * - jeśli chcecie coś wypisać na ekran, użyjcie STDERR ("cerr << "Jakis komunikat\n"")
 * - w chwili obecnej komunikacja z serwerem wykonuje jakoś ze 2 razy więcej zapytan do serwera w celu upewnienia się, że nie zaczęła się nowa runda etc.
 * - wyjątki będą obiektami typu pair<int,string> gdzie int to kod wyjątka, a string - opis tego co się zjebało
 *
 * Opis funkcji
 * ------------
 * connect()        -   służy do nawiązania połączenia z serwerem. Przyjmuje 4 parametry.
 *                      Należy ją wywołać na początku programu, oraz po każdej utracie połączenia (wyjątek (777,"connection lost")).
 *                      Uaktualnia curr_round i curr_turn.
 *
 * wait()           -   Czeka do następnej tury.
 *
 * get_time_raw()   -   zwraca 3 elementowy vector<int> w którym znajdują się wartosci z komendy get_time
 *
 * get_round_number()   -   zwraca na pewno aktualny numer rundy
 *
 * get_current_turn()   -   analogicznie
 *
 * get_turns_till_end() -   zwraca ile ruchow zostalo do końca rundy. Również na pewno aktualna wartość. Włącznie z aktualnym.
 *
 * get_score()      -   zwraca twoj wynik
 *
 * get_all_scores() -   zwraca vector<double> wyników wszystkich drużyn
 *
 * get_my_place()       -   mowi, którzy jestesmy w danej rundzie
 *
 * send_message()   -   wysyla wiadomosc na serwer. Upewnia się, że wiadomość przeszła (konsumując "OK" z pierwszego wiersza odpowiedzi), jeśli nie przeszła rzuca odpowiednim wyjątkiem.
 *                      Może przyjąć zarówno stringa(gotowa wiadomość), jak i vector<string>, który skonkatenuje rozdzielając poszczególne elementy spacjami.
 *
 * get_message()    -   ta funkcja ma 2 wersje. Przyjmuje dodatkowy argument int lines, domyślnie równy 1, i zwraca vector<string>
 *                      tych linii. Ma też wariant z dopiskiem _and_split na koncu, i zamiast stringów
 *                      zwraca vectory słów (ciągów znaków oddzielonych spacjami)
 *
 * send_message_get_response() - łączy funkcjonalność 2 powyższych. Ma też wariant _and_split().
 *
 * split()          -   dzieli stringa na vector<string> słów (ciągów znaków rozdzielonych znakiem splitter,domyślnie spacją)
 *
 * stoi()           -   zmienia stringa w int. Przydatna przy parsowaniu odpowiedzi z serwera.
 *
 * stod()           -   zmienia stringa w double
 *
 * .to_string()     -   zamienia cos niestringowatego na string
 *
 *
 */
#include<vector>
#include<iostream>
#include<string>
#include "CTcpFwd.h"
using namespace std;

vector<vector<int> > parsuj(vector<vector<string> > tmp);
void connect(string ADDRESS, int PORT, string LOGIN, string PASSWORD);
vector<string> split (string x,char splitter = ' ');
void send_message(string x);
vector<string> get_message(int lines=1);
vector<vector<string> > get_message_and_split(int lines=1);
vector<string> send_message_get_response(string msg,int lines=1);
vector<vector<string > > send_message_get_response_and_split(string msg, int lines=1);
void wait();
vector<double> get_all_scores();
double get_score();
int get_my_place();
vector<int> get_time_raw();
int get_round_number();
int get_current_turn();
int get_turns_till_end(); //including this one
